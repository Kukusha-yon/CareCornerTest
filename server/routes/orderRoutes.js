import express from 'express';
import { body } from 'express-validator';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  createOrder,
  getUserOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getOrderStats
} from '../controllers/orderController.js';

const router = express.Router();

// Validation middleware
const orderValidation = [
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.product').isMongoId().withMessage('Invalid product ID'),
  body('items.*.productType')
    .optional()
    .isIn(['product', 'newArrival', 'featuredProduct'])
    .withMessage('Invalid product type'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('items.*.name').trim().notEmpty().withMessage('Product name is required'),
  body('shippingDetails.fullName').trim().notEmpty().withMessage('Full name is required'),
  body('shippingDetails.email').isEmail().withMessage('Please enter a valid email'),
  body('shippingDetails.phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
  body('shippingDetails.address').trim().notEmpty().withMessage('Address is required'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('paymentMethod').isIn(['telebirr', 'abyssinia', 'cbe']).withMessage('Invalid payment method')
];

// Protected routes (require authentication)
router.post('/', protect, orderValidation, createOrder);
router.get('/user', protect, getUserOrders);
router.get('/:id', protect, getOrder);

// Admin routes
router.get('/', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.delete('/:id', protect, deleteOrder);
router.get('/stats', protect, admin, getOrderStats);

export default router; 