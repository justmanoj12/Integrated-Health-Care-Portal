
const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment.model');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  sendMail,
  appointmentConfirmedEmail
} = require('../utils/mailer');


const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create appointment (Patient)
router.post('/', [
  body('doctorId').notEmpty(),
  body('appointmentDate').isISO8601(),
  body('appointmentTime').notEmpty(),
  body('reason').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can book appointments' });
    }

    const appointment = new Appointment({
      patientId: req.user.id,
      doctorId: req.body.doctorId,
      appointmentDate: req.body.appointmentDate,
      appointmentTime: req.body.appointmentTime,
      reason: req.body.reason,
      appointmentType: req.body.appointmentType || 'consultation',
      notes: req.body.notes
    });

    await appointment.save();

    // Emit real-time notification
    const io = req.app.get('io');
    io.to(`user-${req.body.doctorId}`).emit('new-appointment', {
      message: 'New appointment request',
      appointment: appointment
    });

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating appointment', error: error.message });
  }
});

// Get all appointments (with filters)
router.get('/', async (req, res) => {
  try {
    const { status, date, role } = req.query;
    let query = {};

    if (req.user.role === 'patient') {
      query.patientId = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user.id;
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: startDate, $lte: endDate };
    }

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .populate('patientId', 'profile')
      .populate('doctorId', 'profile doctorInfo');

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

// Get single appointment
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'email profile')
      .populate('doctorId', 'profile');


    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    if (appointment.patientId !== req.user.id &&
      appointment.doctorId !== req.user.id &&
      req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointment', error: error.message });
  }
});

// Update appointment status (Doctor/Admin)
router.patch('/:id/status', [
  body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'patientId',
        select: 'email profile'
      })
      .populate({
        path: 'doctorId',
        select: 'profile'
      });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Authorization
    if (
      req.user.role !== 'admin' &&
      appointment.doctorId._id.toString() !== req.user.id &&
      appointment.patientId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = req.body.status;
    await appointment.save();

    const newStatus = req.body.status?.toLowerCase();

    console.log('STATUS RECEIVED:', newStatus);
    console.log('PATIENT EMAIL:', appointment.patientId?.email);

    // 📧 Send email on confirmation (Non-blocking)
    if (newStatus === 'confirmed' && appointment.patientId?.email) {
      sendMail(
        appointment.patientId.email,
        'Your Appointment Has Been Approved',
        appointmentConfirmedEmail({
          patientName: appointment.patientId.profile.firstName,
          doctorName: appointment.doctorId.profile.firstName,
          date: appointment.appointmentDate.toDateString(),
          time: appointment.appointmentTime
        })
      ).then(() => {
        console.log('📧 Confirmation email sent');
      }).catch(err => {
        console.error('❌ Error sending confirmation email:', err);
      });
    }

    // Socket notification
    const io = req.app.get('io');
    io.to(`user-${appointment.patientId._id}`).emit('appointment-updated', {
      message: `Appointment ${newStatus}`,
      appointment
    });

    res.json({
      message: 'Appointment status updated',
      appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating appointment' });
  }
});


// Cancel appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'patientId',
        select: 'email profile'
      })
      .populate({
        path: 'doctorId',
        select: 'profile'
      });


    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Only patient or admin can cancel
    if (appointment.patientId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    // Emit notification
    const io = req.app.get('io');
    io.to(`user-${appointment.doctorId}`).emit('appointment-cancelled', {
      message: 'Appointment cancelled',
      appointment: appointment
    });

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
  }
});

module.exports = router;

