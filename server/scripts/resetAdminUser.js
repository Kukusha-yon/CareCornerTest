import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '../.env') });

const resetAdminUser = async () => {
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

    // Find and delete existing admin user
    const existingAdmin = await User.findOne({ email: 'admin@carecorner.com' });
    if (existingAdmin) {
      console.log('Deleting existing admin user...');
      await User.deleteOne({ _id: existingAdmin._id });
    }

    // Create new admin user
    console.log('Creating new admin user...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@carecorner.com',
      password: 'CareCorner2023!',
      role: 'admin',
      isEmailVerified: true,
      failedLoginAttempts: 0,
      isLocked: false
    });

    console.log('Admin user created successfully:');
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

resetAdminUser(); 