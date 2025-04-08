import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getMarketNews,
  getMarketNewsById,
  createMarketNews,
  updateMarketNews,
  deleteMarketNews
} from '../controllers/marketNewsController.js';

const router = express.Router();

// @desc    Get all market news
// @route   GET /api/market-news
// @access  Public
router.get('/', getMarketNews);

// @desc    Get a market news by ID
// @route   GET /api/market-news/:id
// @access  Public
router.get('/:id', getMarketNewsById);

// @desc    Create a market news
// @route   POST /api/market-news
// @access  Private/Admin
router.post('/', protect, admin, createMarketNews);

// @desc    Update a market news
// @route   PUT /api/market-news/:id
// @access  Private/Admin
router.put('/:id', protect, admin, updateMarketNews);

// @desc    Delete a market news
// @route   DELETE /api/market-news/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteMarketNews);

export default router; 