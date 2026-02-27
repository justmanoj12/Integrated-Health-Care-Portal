const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    ref: 'User'
  },
  recordType: {
    type: String,
    enum: ['lab_report', 'xray', 'scan', 'prescription', 'consultation', 'surgery', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  fileUrl: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  doctorId: {
    type: String,
    ref: 'User'
  },
  hospital: {
    type: String
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
medicalRecordSchema.index({ patientId: 1, date: -1 });
medicalRecordSchema.index({ recordType: 1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);

