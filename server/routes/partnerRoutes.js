import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getPartners,
  createPartner,
  updatePartner,
  deletePartner
} from '../controllers/partnerController.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/', getPartners);

// Protected admin routes
router.use(protect);
router.use(admin);

router.post('/', upload.single('logo'), createPartner);
router.put('/:id', upload.single('logo'), updatePartner);
router.delete('/:id', deletePartner);

export default router; 