import express from 'express';
import { body } from 'express-validator';
import { protect, admin } from '../middleware/authMiddleware.js';
import * as featuredProductController from '../controllers/featuredProductController.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

// Validation middleware
const featuredProductValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('link').trim().notEmpty().withMessage('Link is required'),
  body('order').isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
];

// Public routes
router.get('/', featuredProductController.getFeaturedProducts);
router.get('/:id', featuredProductController.getFeaturedProduct);
router.get('/product/:productId', featuredProductController.getFeaturedProductByProductId);

// Protected admin routes
router.post('/', protect, admin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]), featuredProductValidation, featuredProductController.createFeaturedProduct);
router.put('/:id', protect, admin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]), featuredProductValidation, featuredProductController.updateFeaturedProduct);
router.delete('/:id', protect, admin, featuredProductController.deleteFeaturedProduct);
router.put('/:id/order', protect, admin, featuredProductController.updateFeaturedProductOrder);

export default router; 