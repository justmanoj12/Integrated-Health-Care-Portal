const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const { initPostgres } = require('./config/database');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const doctorRoutes = require('./routes/doctor.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const reviewRoutes = require('./routes/review.routes'); // Added review routes import
const adminRoutes = require('./routes/admin.routes');

// Import middleware
const errorHandler = require('./middleware/errorHandler.middleware');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});


// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare_portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Initialize PostgreSQL (non-blocking so app still boots if PG is absent)
initPostgres();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(morgan('dev'));
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
  credentials: true,
}));



const path = require('path');
const uploadsPath = path.resolve(__dirname, '../uploads');
console.log('📂 Serving uploads from:', uploadsPath);
app.use('/uploads', (req, res, next) => {
  console.log('📂 Static file request:', req.method, req.url);
  next();
}, express.static(uploadsPath));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Make io accessible to routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('join-room', async (userId) => {
    const roomName = `user-${userId}`;
    socket.join(roomName);
    console.log(`✅ User ${userId} joined room: ${roomName}`);

    // Fetch and send any unread notifications for this user
    try {
      const User = require('./models/User.model');
      const Notification = require('./models/Notification.model');

      const user = await User.findById(userId).select('role');
      if (user) {
        // Find notifications that match this user:
        // 1. Notifications sent specifically to this user (recipientId)
        // 2. Notifications sent to their role (recipientRole)
        // 3. Notifications sent to 'all'
        const unreadNotifications = await Notification.find({
          $or: [
            { recipientId: userId },
            { recipientRole: user.role },
            { recipientRole: 'all' }
          ],
          // Only get recent notifications (last 7 days) to avoid flooding
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
          .sort({ createdAt: -1 })
          .limit(50); // Limit to 50 most recent

        if (unreadNotifications.length > 0) {
          console.log(`📬 Sending ${unreadNotifications.length} unread notifications to user ${userId}`);

          unreadNotifications.forEach(notif => {
            const notificationData = {
              id: notif._id.toString(),
              title: notif.title,
              message: notif.message,
              type: notif.type,
              timestamp: notif.createdAt.toISOString(),
              read: false,
            };

            socket.emit('notification', notificationData);
          });
        }
      }
    } catch (error) {
      console.error('❌ Error fetching notifications for user:', error);
    }

    // Send confirmation back to client
    socket.emit('room-joined', { roomName, userId });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Healthcare Portal API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

module.exports = { app, server, io };

