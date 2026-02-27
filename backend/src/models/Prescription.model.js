const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
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
  medications: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: String
  }],
  diagnosis: {
    type: String,
    required: true
  },
  symptoms: [String],
  tests: [{
    name: String,
    description: String
  }],
  followUpDate: {
    type: Date
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1 });
prescriptionSchema.index({ appointmentId: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);

