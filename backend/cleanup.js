require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User.model');

(async () => {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const email = 'bhargavchaganti1@gmail.com';
    const result = await User.deleteOne({ email });
    console.log(`Deleted ${result.deletedCount} user(s) with email: ${email}`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
