const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function () {
      // Password is required if googleId is NOT present
      return !this.googleId;
    }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values (for non-Google users)
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    dateOfBirth: { type: Date },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    profilePicture: { type: String }
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    required: true,
    default: 'patient'
  },
  // Overall account status for access control
  status: {
    type: String,
    enum: ['active', 'pending', 'rejected'],
    default: 'active'
  },
  // Backwards-compatible flag used across the app
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otpCode: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  // Doctor-specific fields
  doctorInfo: {
    specialization: String,
    qualifications: [String],
    experience: Number,
    consultationFee: Number,
    bio: String,
    availableSlots: [{
      day: String,
      startTime: String,
      endTime: String
    }],
    averageRating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  // Patient-specific fields
  patientInfo: {
    bloodGroup: String,
    allergies: [String],
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'doctorInfo.specialization': 1 });

module.exports = mongoose.model('User', userSchema);
