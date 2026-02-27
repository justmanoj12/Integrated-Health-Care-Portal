const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    ref: 'User'
  },
  doctorId: {
    type: String,
    required: true,
    ref: 'User'
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  appointmentType: {
    type: String,
    enum: ['consultation', 'follow-up', 'checkup', 'emergency'],
    default: 'consultation'
  },
  reason: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isRated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);

