const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Creates default admin and maintenance accounts if they don't exist
 * This runs automatically on server startup
 */
async function createDefaultAdmins() {
  try {
    console.log('🔍 Checking for admin accounts...');

    // Create Admin Account
    const adminEmail = 'freelanciapp@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('anyaay', 10);
      await User.create({
        email: adminEmail,
        password: adminPassword,
        name: 'Admin',
        userType: 'admin',
        role: 'admin',
        isApproved: true,
        isDeleted: false
      });
      console.log('✅ Admin account created successfully!');
      console.log(`   Email: ${adminEmail}`);
      console.log('   Password: anyaay');
    } else {
      console.log('ℹ️  Admin account already exists');
    }

    // Create Maintenance Account
    const maintenanceEmail = 'anesgaher3000@gmail.com';
    const maintenanceExists = await User.findOne({ email: maintenanceEmail });
    
    if (!maintenanceExists) {
      const maintenancePassword = await bcrypt.hash('lajajataanes', 10);
      await User.create({
        email: maintenanceEmail,
        password: maintenancePassword,
        name: 'Maintenance',
        userType: 'maintenance',
        role: 'maintenance',
        isApproved: true,
        isDeleted: false
      });
      console.log('✅ Maintenance account created successfully!');
      console.log(`   Email: ${maintenanceEmail}`);
      console.log('   Password: lajajataanes');
    } else {
      console.log('ℹ️  Maintenance account already exists');
    }

    console.log('🎉 Admin accounts check complete!');
  } catch (error) {
    console.error('❌ Error creating admin accounts:', error.message);
    // Don't throw error, just log it - server should still start
  }
}

module.exports = createDefaultAdmins;
