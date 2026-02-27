const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const User = require('../models/User.model')

// Initialize MongoDB - Create admin user
const initMongoDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare_portal', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ Connected to MongoDB')

    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@healthcare.com' })
    
    if (!adminExists) {
      // Create admin user
      const adminUser = new User({
        email: 'admin@healthcare.com',
        password: 'admin123', // Will be hashed by pre-save hook
        profile: {
          firstName: 'Admin',
          lastName: 'User'
        },
        role: 'admin',
        isActive: true
      })

      await adminUser.save()
      console.log('✅ Admin user created (email: admin@healthcare.com, password: admin123)')
    } else {
      console.log('ℹ️  Admin user already exists')
    }

    console.log('✅ MongoDB initialization complete')
  } catch (error) {
    console.error('❌ Error initializing MongoDB:', error)
    throw error
  } finally {
    await mongoose.connection.close()
  }
}

// Run initialization
if (require.main === module) {
  initMongoDB()
    .then(() => {
      console.log('✅ Database initialization complete')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Initialization failed:', error)
      process.exit(1)
    })
}

module.exports = { initMongoDB }
