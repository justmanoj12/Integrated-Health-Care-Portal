const express = require('express');
const { body, validationResult } = require('express-validator');
const Prescription = require('../models/Prescription.model');
const Appointment = require('../models/Appointment.model');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

// Create prescription (Doctor only)
router.post('/', [
  body('appointmentId').notEmpty(),
  body('diagnosis').trim().notEmpty(),
  body('medications').isArray().notEmpty()
], authorize('doctor', 'admin'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const appointment = await Appointment.findById(req.body.appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctorId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const prescription = new Prescription({
      appointmentId: req.body.appointmentId,
      patientId: appointment.patientId,
      doctorId: req.user.userId.toString(),
      medications: req.body.medications,
      diagnosis: req.body.diagnosis,
      symptoms: req.body.symptoms || [],
      tests: req.body.tests || [],
      followUpDate: req.body.followUpDate,
      notes: req.body.notes
    });

    await prescription.save();

    // Update appointment with prescription
    appointment.prescriptionId = prescription._id;
    appointment.status = 'completed';
    await appointment.save();

    // Emit notification
    const io = req.app.get('io');
    io.to(`user-${appointment.patientId}`).emit('prescription-created', {
      message: 'New prescription available',
      prescription: prescription
    });

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating prescription', error: error.message });
  }
});

// Get prescriptions
router.get('/', async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patientId = req.user.userId.toString();
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user.userId.toString();
    }

    const prescriptions = await Prescription.find(query)
      .sort({ createdAt: -1 })
      .populate('appointmentId')
      .populate('doctorId', 'profile doctorInfo')
      .populate('patientId', 'profile');

    res.json({ prescriptions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
  }
});

// Get single prescription
router.get('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Authorization check
    if (prescription.patientId !== req.user.userId.toString() &&
      prescription.doctorId !== req.user.userId.toString() &&
      req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ prescription });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prescription', error: error.message });
  }
});

module.exports = router;

