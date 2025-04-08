import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in the parent directory
dotenv.config({ path: join(__dirname, '../.env') });

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    const uri = process.env.MONGODB_URI;
    console.log('MongoDB URI:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@'));
    
    // Parse the URI to check its components
    const uriParts = uri.split('@');
    if (uriParts.length !== 2) {
      throw new Error('Invalid MongoDB URI format');
    }
    
    const authPart = uriParts[0].split('//')[1];
    const [username, password] = authPart.split(':');
    const hostPart = uriParts[1].split('/')[0];
    const dbName = uriParts[1].split('/')[1].split('?')[0];
    
    console.log('Connection details:');
    console.log('- Username:', username);
    console.log('- Host:', hostPart);
    console.log('- Database:', dbName);
    
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2
    });

    console.log('MongoDB Connected Successfully!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    
    // List all collections in the database
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Run the test
testConnection(); 