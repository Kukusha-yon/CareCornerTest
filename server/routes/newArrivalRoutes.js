import express from 'express';
import {
  getAllNewArrivals,
  getNewArrivalById,
  createNewArrival,
  updateNewArrival,
  deleteNewArrival,
  getAdminNewArrivals
} from '../controllers/newArrivalController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/', getAllNewArrivals);

// Admin routes - must come before /:id route
router.get('/admin', protect, admin, getAdminNewArrivals);
router.post('/', protect, admin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]), createNewArrival);
router.put('/:id', protect, admin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]), updateNewArrival);
router.delete('/:id', protect, admin, deleteNewArrival);

// Public route for getting a single new arrival
router.get('/:id', getNewArrivalById);

export default router; 