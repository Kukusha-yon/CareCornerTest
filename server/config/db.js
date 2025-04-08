import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Log connection attempt with masked credentials
    const maskedUri = process.env.MONGODB_URI.replace(/(mongodb\+srv:\/\/)[^:]+:[^@]+@/, '$1****:****@');
    console.log('Attempting to connect to MongoDB:', maskedUri);

    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      connectTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 30000, // 30 seconds
      heartbeatFrequencyMS: 10000, // 10 seconds
      autoIndex: false, // Disable auto-indexing to avoid timeout issues
      bufferCommands: false, // Disable buffering to avoid memory issues
      maxPoolSize: 10, // Limit the number of connections in the pool
      minPoolSize: 2, // Maintain at least 2 connections
      maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
      retryWrites: true,
      w: 'majority',
      authSource: 'admin'
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    // Log successful connection
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      if (err.name === 'MongoServerError' && err.message.includes('bad auth')) {
        console.error('Authentication failed. Please check your MongoDB credentials and IP whitelist.');
      } else if (err.name === 'MongoNetworkError') {
        console.error('Network error. Please check your internet connection and MongoDB Atlas status.');
      }
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });

    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    if (error.name === 'MongoServerError' && error.message.includes('bad auth')) {
      console.error('Authentication failed. Please check your MongoDB credentials and IP whitelist.');
    } else if (error.name === 'MongoNetworkError') {
      console.error('Network error. Please check your internet connection and MongoDB Atlas status.');
    }
    throw error;
  }
};

export default connectDB; 