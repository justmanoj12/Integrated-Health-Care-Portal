require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User.model');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const allUsers = await User.find({}, 'email firstName lastName isVerified');
    console.log(`\nTotal users: ${allUsers.length}`);
    console.log('\nAll users:');
    allUsers.forEach(u => {
      console.log(`  - ${u.email} (${u.firstName} ${u.lastName}) - Verified: ${u.isVerified}`);
    });
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
