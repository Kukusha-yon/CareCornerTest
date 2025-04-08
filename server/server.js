import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();
console.log('Environment:', process.env.NODE_ENV);
console.log('Cloudinary Bypass:', process.env.CLOUDINARY_BYPASS);
console.log('Cloudinary Variables Present:', {
  cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: !!process.env.CLOUDINARY_API_KEY,
  apiSecret: !!process.env.CLOUDINARY_API_SECRET
});

// Log MongoDB connection details (with credentials masked)
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (mongoUri) {
  if (mongoUri.includes('@')) {
    console.log('MongoDB URI:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@'));
  } else {
    console.log('MongoDB URI:', mongoUri);
  }
} else {
  console.error('No MongoDB URI found in environment variables!');
}

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import featuredProductRoutes from './routes/featuredProductRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { initializeSettings } from './controllers/settingController.js';
import newArrivalRoutes from './routes/newArrivalRoutes.js';
import marketNewsRoutes from './routes/marketNewsRoutes.js';

// Connect to MongoDB with error handling
let dbConnected = false;
try {
  await connectDB();
  dbConnected = true;
  console.log('✅ MongoDB connected successfully');
} catch (error) {
  console.error('MongoDB connection error:', error.message);
  if (error.name === 'MongoServerError' && error.message.includes('bad auth')) {
    console.error('Authentication failed. Please check your MongoDB credentials and IP whitelist.');
  } else if (error.name === 'MongoNetworkError') {
    console.error('Network error. Please check your internet connection and MongoDB Atlas status.');
  }
}

// Create Express app
const app = express();

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", 
        process.env.CLIENT_URL || "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5000",
        "https://api.alphavantage.co",
        "https://newsdata.io"
      ],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:5173',
  process.env.ADMIN_URL,
  process.env.API_URL,
  'https://*.vercel.app' // Allow all Vercel domains
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(globalLimiter);

// Body parser
app.use(express.json({ limit: '10kb' })); // Limit body size to 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization
app.use(xss()); // Sanitize data
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Compression
app.use(compression());

// API Routes - register these BEFORE the error handler
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/featured-products', featuredProductRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/new-arrivals', newArrivalRoutes);
app.use('/api/market-news', marketNewsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/external', apiRoutes);

// Error handling - should come AFTER routes
app.use(errorHandler);

// Initialize settings
if (dbConnected) {
  try {
    await initializeSettings();
    console.log('Settings initialized successfully');
  } catch (error) {
    console.error('Error initializing settings:', error.message);
  }
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  const staticPath = path.join(__dirname, '../client/dist');
  app.use(express.static(staticPath));
  
  // Serve index.html for any route not matching API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
  
  console.log('✓ Serving static files from:', staticPath);
} else {
  // Serve static files from uploads directory (for development without Cloudinary)
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  
  // For API testing in development
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  if (!dbConnected) {
    console.warn('WARNING: Server is running without database connection. Some features may not work.');
  }
}); 