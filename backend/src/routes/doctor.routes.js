const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User.model');
const Appointment = require('../models/Appointment.model');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.use(authenticate);

// Helper: generate time slots between start and end (inclusive) at 30-min intervals
const buildTimeSlots = (startTime, endTime, intervalMinutes = 30) => {
  if (!startTime || !endTime) return [];

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let current = new Date(0, 0, 0, startH, startM, 0);
  const end = new Date(0, 0, 0, endH, endM, 0);

  const slots = [];
  while (current <= end) {
    const h = current.getHours().toString().padStart(2, '0');
    const m = current.getMinutes().toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    current = new Date(current.getTime() + intervalMinutes * 60000);
  }
  return slots;
};
router.use(authenticate);

// Get all doctors (for patient to select)
router.get('/list', async (req, res) => {
  try {
    const { specialization } = req.query;
    // Only show doctors who are approved/active to patients
    let query = {
      role: 'doctor',
      isActive: true,
      $or: [
        { status: { $exists: false } }, // backward compatibility
        { status: 'active' }
      ]
    };

    if (specialization) {
      query['doctorInfo.specialization'] = new RegExp(specialization, 'i');
    }

    const doctors = await User.find(query)
      .select('_id profile doctorInfo')
      .limit(50);

    res.json({ doctors });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
});

// Get doctor availability for a specific date (patients use this when booking)
router.get('/:id/availability', async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const doctor = await User.findById(doctorId).select('role doctorInfo.availableSlots');
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const targetDate = new Date(date);
    if (Number.isNaN(targetDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    // Day name should match what doctors set in their availability (e.g., "Monday")
    const weekday = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

    const allSlots = (doctor.doctorInfo?.availableSlots || []).filter(
      (s) => s.day === weekday
    );

    // Build discrete time slots (30-min) from ranges
    let possibleSlots = [];
    allSlots.forEach((slot) => {
      possibleSlots = possibleSlots.concat(
        buildTimeSlots(slot.startTime, slot.endTime)
      );
    });

    // Remove duplicates
    possibleSlots = [...new Set(possibleSlots)];

    if (!possibleSlots.length) {
      return res.json({ availableSlots: [] });
    }

    // Fetch confirmed appointments for that doctor & date to block those times
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const confirmedAppointments = await Appointment.find({
      doctorId: doctorId.toString(),
      status: 'confirmed',
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    }).select('appointmentTime');

    const bookedTimes = new Set(
      confirmedAppointments.map((a) => a.appointmentTime)
    );

    const availableSlots = possibleSlots.filter(
      (time) => !bookedTimes.has(time)
    );

    res.json({ availableSlots });
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    res
      .status(500)
      .json({ message: 'Error fetching availability', error: error.message });
  }
});

// Get doctor profile
router.get('/profile', authorize('doctor'), async (req, res) => {
  try {
    const doctor = await User.findById(req.user.userId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ doctor });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update doctor profile
router.put('/profile', [
  upload.single('profilePicture'),
  (req, res, next) => {
    // Parse JSON strings back to objects (for FormData)
    const parseField = (field) => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        try {
          if (req.body[field].trim() === '') return; // Ignore empty strings
          req.body[field] = JSON.parse(req.body[field]);
        } catch (e) {
          console.error(`Failed to parse ${field}:`, e);
          // Don't crash, just let it be (validator might catch it or it will be ignored)
        }
      }
    };

    parseField('availableSlots');
    parseField('qualifications');
    parseField('address');
    parseField('emergencyContact');

    if (req.body.experience && typeof req.body.experience === 'string') {
      const parsedComp = Number(req.body.experience);
      req.body.experience = isNaN(parsedComp) ? null : parsedComp;
    }
    if (req.body.consultationFee && typeof req.body.consultationFee === 'string') {
      const parsedFee = Number(req.body.consultationFee);
      req.body.consultationFee = isNaN(parsedFee) ? null : parsedFee;
    }

    console.log('Processed Body:', req.body); // DEBUG LOG
    next();
  },
  body('specialization').optional().trim(),
  body('qualifications').optional().isArray(),
  // Allow empty / missing numeric fields; only validate when actually provided
  body('experience')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('Experience must be a non-negative integer'),
  body('consultationFee')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a non-negative number'),
], authorize('doctor'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation Errors:', errors.array()); // DEBUG LOG
      return res.status(400).json({ errors: errors.array() });
    }

    const doctor = await User.findById(req.user.userId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (req.file) {
      // Normalize path to use forward slashes for URL consistency
      doctor.profile.profilePicture = req.file.path.replace(/\\/g, '/');
    }

    if (req.body.firstName) doctor.profile.firstName = req.body.firstName;
    if (req.body.lastName) doctor.profile.lastName = req.body.lastName;
    if (req.body.phone) doctor.profile.phone = req.body.phone;
    if (req.body.specialization) doctor.doctorInfo.specialization = req.body.specialization;
    if (req.body.qualifications) doctor.doctorInfo.qualifications = req.body.qualifications;
    if (req.body.experience !== undefined) doctor.doctorInfo.experience = req.body.experience;
    if (req.body.consultationFee !== undefined) doctor.doctorInfo.consultationFee = req.body.consultationFee;
    if (req.body.bio) doctor.doctorInfo.bio = req.body.bio;
    if (req.body.availableSlots) doctor.doctorInfo.availableSlots = req.body.availableSlots;

    await doctor.save();
    res.json({ message: 'Profile updated successfully', doctor });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get doctor's appointments
router.get('/appointments', authorize('doctor'), async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = { doctorId: req.user.userId.toString() };

    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: startDate, $lte: endDate };
    }

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .populate('patientId', 'profile patientInfo');

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

module.exports = router;

