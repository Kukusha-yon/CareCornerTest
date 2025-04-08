import express from 'express';
import { getSettings, getSetting, updateSetting } from '../controllers/settingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getSettings);
router.get('/:key', getSetting);

// Protected admin routes
router.put('/:key', protect, admin, updateSetting);

export default router; 