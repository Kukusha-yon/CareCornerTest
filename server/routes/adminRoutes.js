import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getAnalytics,
  getDashboard,
  getOrderStats,
  getProductStats,
  getCustomerStats,
  createUser
} from '../controllers/adminController.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(admin);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Admin route error:', err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Dashboard statistics
router.get('/stats', getStats);
router.get('/dashboard', getDashboard);

// Specific stats endpoints
router.get('/orders/stats', getOrderStats);
router.get('/products/stats', getProductStats);
router.get('/customers/stats', getCustomerStats);

// Analytics data
router.get('/analytics', getAnalytics);

// User management
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

// Settings management
router.get('/settings', getSettings);
router.put('/settings', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 }
]), updateSettings);

export default router; 