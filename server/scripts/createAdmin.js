import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const uri = process.env.MONGODB_URI;
    console.log('MongoDB URI:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@'));

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log('MongoDB Connected Successfully!');

    // Check if admin exists
    let adminUser = await User.findOne({ email: 'admin@carecorner.com' });
    
    if (adminUser) {
      console.log('Admin user exists, updating password...');
      adminUser.password = 'CareCorner2023!';
      adminUser.isEmailVerified = true;
      adminUser.failedLoginAttempts = 0;
      adminUser.isLocked = false;
      adminUser.lockUntil = null;
      await adminUser.save();
    } else {
      console.log('Creating new admin user...');
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@carecorner.com',
        password: 'CareCorner2023!',
        role: 'admin',
        isEmailVerified: true
      });
    }
    
    console.log('Admin user updated/created successfully:');
    console.log('ID:', adminUser._id);
    console.log('Name:', adminUser.name);
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('Is Email Verified:', adminUser.isEmailVerified);
    console.log('Failed Login Attempts:', adminUser.failedLoginAttempts);
    console.log('Is Locked:', adminUser.isLocked);

    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin(); 