const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User.model');
const MedicalRecord = require('../models/MedicalRecord.model');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.use(authenticate);

// Get patient profile
router.get('/profile', authorize('patient'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update patient profile
router.put('/profile', [
  upload.single('profilePicture'),
  (req, res, next) => {
    try {
      if (typeof req.body.address === 'string') {
        req.body.address = JSON.parse(req.body.address);
      }
      if (typeof req.body.emergencyContact === 'string') {
        req.body.emergencyContact = JSON.parse(req.body.emergencyContact);
      }
    } catch (e) {
      return res.status(400).json({ message: 'Invalid JSON format in form data' });
    }
    next();
  },
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().trim()
], authorize('patient'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.file) {
      user.profile.profilePicture = req.file.path.replace(/\\/g, '/');
    }

    if (req.body.firstName) user.profile.firstName = req.body.firstName;
    if (req.body.lastName) user.profile.lastName = req.body.lastName;
    if (req.body.phone) user.profile.phone = req.body.phone;
    if (req.body.dateOfBirth) user.profile.dateOfBirth = req.body.dateOfBirth;
    if (req.body.address) user.profile.address = { ...user.profile.address, ...req.body.address };
    if (req.body.bloodGroup) user.patientInfo.bloodGroup = req.body.bloodGroup;
    if (req.body.allergies) user.patientInfo.allergies = req.body.allergies;
    if (req.body.emergencyContact) {
      user.patientInfo.emergencyContact = { ...user.patientInfo.emergencyContact, ...req.body.emergencyContact };
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get medical records
router.get('/medical-records', authorize('patient'), async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patientId: req.user.userId.toString() })
      .sort({ date: -1 });
    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medical records', error: error.message });
  }
});

// Add medical record
router.post('/medical-records', [
  body('recordType').isIn(['lab_report', 'xray', 'scan', 'prescription', 'consultation', 'surgery', 'other']),
  body('title').trim().notEmpty(),
  body('date').isISO8601()
], authorize('patient'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const record = new MedicalRecord({
      patientId: req.user.userId.toString(),
      ...req.body
    });

    await record.save();
    res.status(201).json({ message: 'Medical record added', record });
  } catch (error) {
    res.status(500).json({ message: 'Error adding medical record', error: error.message });
  }
});

module.exports = router;

