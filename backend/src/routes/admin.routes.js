const express = require('express');
const User = require('../models/User.model');
const Appointment = require('../models/Appointment.model');
const Prescription = require('../models/Prescription.model');
const Notification = require('../models/Notification.model');
const { getPgPool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

const recordSqlSnapshot = async (snapshot) => {
  try {
    const pool = getPgPool();
    if (!pool) return;
    await pool.query(`
      INSERT INTO analytics_snapshots (
        patients, doctors, admins, appointments, prescriptions
      ) VALUES ($1, $2, $3, $4, $5)
    `, [
      snapshot.patients || 0,
      snapshot.doctors || 0,
      snapshot.admins || 0,
      snapshot.appointments || 0,
      snapshot.prescriptions || 0
    ]);
  } catch (err) {
    console.warn('⚠️ Skipping SQL analytics write:', err.message);
  }
};

// Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    // Get user counts from MongoDB
    const userCounts = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get appointment statistics from MongoDB
    const totalAppointments = await Appointment.countDocuments();
    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const totalPrescriptions = await Prescription.countDocuments();

    // Get recent appointments
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('patientId', 'profile')
      .populate('doctorId', 'profile doctorInfo');

    const analytics = {
      users: userCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      appointments: {
        total: totalAppointments,
        byStatus: appointmentsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      prescriptions: totalPrescriptions
    };

    // Persist a snapshot to PostgreSQL (non-blocking)
    recordSqlSnapshot({
      patients: analytics.users.patient,
      doctors: analytics.users.doctor,
      admins: analytics.users.admin,
      appointments: analytics.appointments.total,
      prescriptions: analytics.prescriptions
    });

    res.json({
      analytics,
      recentAppointments
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
});

// Retrieve SQL-backed analytics snapshots (PostgreSQL)
router.get('/analytics/sql', async (req, res) => {
  try {
    const pool = getPgPool();
    if (!pool) {
      return res.status(503).json({ message: 'PostgreSQL not configured' });
    }

    const { rows } = await pool.query(`
      SELECT patients, doctors, admins, appointments, prescriptions, captured_at
      FROM analytics_snapshots
      ORDER BY captured_at DESC
      LIMIT 20
    `);

    res.json({ snapshots: rows });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching SQL analytics', error: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { role, isActive } = req.query;
    let query = {};

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const users = await User.find(query)
      .select('email role isActive status createdAt')
      .sort({ createdAt: -1 });

    res.json({ users: users.map(u => ({
      id: u._id,
      email: u.email,
      role: u.role,
      status: u.status,
      is_active: u.isActive,
      created_at: u.createdAt
    })) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Update user status / approval
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { isActive, status } = req.body;

    const update = {};
    if (typeof isActive === 'boolean') update.isActive = isActive;
    if (status) update.status = status;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).select('email role isActive status');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'User status updated', 
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        is_active: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
});

// Get all doctors with details
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: true })
      .select('email profile doctorInfo createdAt')
      .sort({ createdAt: -1 });

    res.json({ doctors });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
});

// Get all patients with details
router.get('/patients', async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient', isActive: true })
      .select('email profile createdAt')
      .sort({ createdAt: -1 });

    res.json({ patients });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
});

// Send notification to users

router.post('/notifications/send', async (req, res) => {
  try {
    console.log('🔔 NOTIFICATION BODY:', req.body);
    console.log('👤 AUTH USER:', req.user);

    const { title, message, recipientRole, recipientId, type } = req.body;
    const io = req.app.get('io');

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    if (!io) {
      return res.status(500).json({ message: 'Socket.IO not initialized' });
    }

    // Validate and normalize recipientRole (trim whitespace, lowercase)
    const validRoles = ['patient', 'doctor', 'admin', 'all'];
    const normalizedRole = recipientRole ? String(recipientRole).trim().toLowerCase() : null;
    const finalRecipientRole = normalizedRole && validRoles.includes(normalizedRole) ? normalizedRole : 'all';
    
    console.log('📋 Notification Request:');
    console.log('  - Full request body:', JSON.stringify(req.body, null, 2));
    console.log('  - recipientRole from request (raw):', recipientRole, `(type: ${typeof recipientRole})`);
    console.log('  - normalizedRole:', normalizedRole);
    console.log('  - normalizedRole in validRoles?', normalizedRole && validRoles.includes(normalizedRole));
    console.log('  - finalRecipientRole:', finalRecipientRole);
    console.log('  - recipientId:', recipientId);
    
    // CRITICAL: Log if we're about to send to everyone when we shouldn't
    if (finalRecipientRole === 'all' && normalizedRole && normalizedRole !== 'all') {
      console.error('❌ ERROR: recipientRole was normalized to "all" but should be:', normalizedRole);
    }

    const notification = new Notification({
      title,
      message,
      recipientId: recipientId || null,
      recipientRole: finalRecipientRole,
      type: type || 'info',
      createdBy: req.user.id
    });

    await notification.save();

    let recipients = [];

    // STRICT FILTERING: Only send to specified recipients
    if (recipientId) {
      // Send to specific user
      recipients = [recipientId];
      console.log(`🎯 Sending to specific user: ${recipientId}`);
    } else if (finalRecipientRole === 'all') {
      // Explicitly send to all users
      const users = await User.find({ isActive: true }).select('_id email role');
      recipients = users.map(u => u._id.toString());
      console.log(`🌍 Sending to ALL ${users.length} active users`);
    } else if (finalRecipientRole && ['patient', 'doctor', 'admin'].includes(finalRecipientRole)) {
      // Send ONLY to users with the specified role (strict check)
      const users = await User.find({ 
        role: finalRecipientRole, 
        isActive: true 
      }).select('_id email role');
      
      recipients = users.map(u => u._id.toString());
      console.log(`👥 Found ${users.length} ${finalRecipientRole} users:`);
      users.forEach(u => {
        console.log(`   - ${u.email} (${u.role}) - ID: ${u._id.toString()}`);
      });
      
      if (recipients.length === 0) {
        console.warn(`⚠️ No ${finalRecipientRole} users found!`);
      }
    } else {
      // Invalid recipientRole - don't send to anyone
      console.error(`❌ Invalid recipientRole: ${finalRecipientRole}. Not sending notification.`);
      return res.status(400).json({ 
        message: `Invalid recipientRole: ${finalRecipientRole}. Must be 'patient', 'doctor', 'admin', or 'all'` 
      });
    }

    const notificationData = {
      id: notification._id.toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      timestamp: notification.createdAt.toISOString(),
      read: false
    };

    console.log(`📤 Sending notification to ${recipients.length} recipients (role: ${recipientRole || 'all'})`);
    
    if (recipients.length === 0) {
      console.warn('⚠️ No recipients found! Notification will not be delivered.');
      return res.status(400).json({ 
        message: `No ${finalRecipientRole} users found to send notification to` 
      });
    }
    
    // Get all connected socket rooms to debug
    const rooms = io.sockets.adapter.rooms;
    const userRooms = Array.from(rooms.keys()).filter(r => r.startsWith('user-'));
    console.log(`🔍 Available user rooms (${userRooms.length}):`, userRooms.slice(0, 10));
    
    let deliveredCount = 0;
    
    // CRITICAL SAFETY CHECK: Verify we're only sending to intended recipients
    if (finalRecipientRole !== 'all') {
      // Double-check that all recipients have the correct role
      const mongoose = require('mongoose');
      const recipientUsers = await User.find({ 
        _id: { $in: recipients.map(id => new mongoose.Types.ObjectId(id)) }
      }).select('_id email role');
      
      const wrongRoleUsers = recipientUsers.filter(u => u.role !== finalRecipientRole);
      if (wrongRoleUsers.length > 0) {
        console.error('❌ CRITICAL ERROR: Found users with wrong role in recipients list!');
        wrongRoleUsers.forEach(u => {
          console.error(`   - ${u.email} has role "${u.role}" but should be "${finalRecipientRole}"`);
        });
        // Remove wrong role users from recipients
        recipients = recipients.filter(id => {
          const user = recipientUsers.find(u => u._id.toString() === id);
          return user && user.role === finalRecipientRole;
        });
        console.log(`   ✅ Filtered recipients to ${recipients.length} correct users`);
      }
    }
    
    recipients.forEach(userId => {
      const roomName = `user-${userId}`;
      const roomExists = rooms.has(roomName);
      console.log(`  → Emitting to room: ${roomName} (exists: ${roomExists})`);
      // CRITICAL: Only emit to specific room, never broadcast
      io.to(roomName).emit('notification', notificationData);
      if (roomExists) {
        deliveredCount++;
      }
    });
    
    console.log(`✅ Notification emitted to ${deliveredCount}/${recipients.length} connected users`);
    console.log(`✅ Final recipientRole: ${finalRecipientRole}, Total recipients: ${recipients.length}`);

    res.json({
      message: 'Notification sent successfully',
      notification: {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        recipientRole: finalRecipientRole,
        totalRecipients: recipients.length,
        connectedRecipients: deliveredCount
      }
    });

  } catch (error) {
    console.error('❌ NOTIFICATION ERROR:', error);
    res.status(500).json({ message: 'Error sending notification', error: error.message });
  }
});


module.exports = router;
