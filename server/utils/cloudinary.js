import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directly set environment override for quick fix
// Remove this line in production when proper credentials are set
process.env.CLOUDINARY_BYPASS = 'true';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Create a local uploads directory for all environments when using local storage
const uploadsDir = path.join(__dirname, '../../uploads');
// Always ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory at:', uploadsDir);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Validate Cloudinary configuration
const validateCloudinaryConfig = () => {
  // Debug environment variables
  console.log('CLOUDINARY_BYPASS value:', process.env.CLOUDINARY_BYPASS);
  console.log('Cloudinary Variables:', {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'Not found',
    apiKey: process.env.CLOUDINARY_API_KEY ? 'Present' : 'Not found',
    apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Not found'
  });

  // Allow bypass in any environment if explicitly set to 'true'
  if (process.env.CLOUDINARY_BYPASS === 'true') {
    console.warn('⚠️ Running with CLOUDINARY_BYPASS=true');
    console.warn('⚠️ File uploads will be stored locally in the /uploads directory.');
    console.warn('⚠️ This should only be used for development or testing.');
    return false;
  }

  if (isDevelopment) {
    console.warn('Running in development mode without Cloudinary credentials.');
    console.warn('File uploads will be stored locally in the /uploads directory.');
    return false;
  }

  // Check for required environment variables
  const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('Missing Cloudinary environment variables:', missingVars.join(', '));
    console.warn('Falling back to local file storage');
    return false;
  }
  
  return true;
};

// Configure Cloudinary or local storage
let upload;
let isCloudinaryConfigured = false;

try {
  isCloudinaryConfigured = validateCloudinaryConfig();
  
  if (isCloudinaryConfigured) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    // Configure Cloudinary storage
    const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'carecorner',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
      }
    });
    
    upload = multer({ storage: storage });
  } else {
    // Configure local storage
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, uploadsDir);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });
    
    upload = multer({ storage: storage });
  }
} catch (error) {
  console.error('Cloudinary configuration error:', error.message);
  console.warn('Falling back to local file storage');
  
  // Configure local storage as fallback
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  upload = multer({ storage: storage });
}

// Export the configured upload middleware
export { upload };

// Upload a single file to Cloudinary or local storage
export const uploadToCloudinary = async (file) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }
    
    if (isCloudinaryConfigured) {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'carecorner',
        resource_type: 'auto'
      });
      return result;
    } else {
      // Return local file path
      return {
        secure_url: `/uploads/${file.filename}`,
        public_id: file.filename,
        url: `/uploads/${file.filename}`
      };
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Delete a file from Cloudinary or local storage
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (isCloudinaryConfigured) {
      // Delete from Cloudinary
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } else {
      // Delete from local storage
      const filePath = path.join(uploadsDir, publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return { result: 'ok' };
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Get public ID from Cloudinary URL
export const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  if (isCloudinaryConfigured) {
    // Extract public ID from Cloudinary URL
    const matches = url.match(/\/v\d+\/([^/]+)\.\w+$/);
    return matches ? matches[1] : null;
  } else {
    // For local storage, return the filename
    return url.split('/').pop();
  }
}; 