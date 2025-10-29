const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import User model
const User = require('./models/User');

// Admin user data
const adminUser = {
  name: 'Admin',
  email: 'admin@greenhaven.com',
  password: 'admin123',
  phoneNumber: '+1234567890',
  address: 'Green Haven Nursery HQ',
  role: 'admin',
  preferredPlantType: 'all'
};

// Connect to MongoDB and seed admin
const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      
      // Update password if needed
      const updatePassword = true; // Set to true to update password
      if (updatePassword) {
        const salt = await bcrypt.genSalt(10);
        existingAdmin.password = await bcrypt.hash(adminUser.password, salt);
        await existingAdmin.save();
        console.log('✅ Admin password updated!');
      }
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      adminUser.password = await bcrypt.hash(adminUser.password, salt);

      // Create admin user
      const admin = await User.create(adminUser);
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', admin.email);
      console.log('👤 Name:', admin.name);
      console.log('🔑 Role:', admin.role);
    }

    console.log('\n🎉 Admin seeding completed!');
    console.log('\nLogin credentials:');
    console.log('Email: admin@greenhaven.com');
    console.log('Password: admin123');
    console.log('\n⚠️  Remember to change this password in production!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

// Run the seeder
seedAdmin();
