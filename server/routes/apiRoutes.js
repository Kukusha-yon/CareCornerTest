import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import axios from 'axios';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
router.use(apiLimiter);

// Alpha Vantage API endpoint - Public route
router.get('/stock-data', async (req, res) => {
  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol: 'AAPL',
        interval: '5min',
        apikey: process.env.ALPHA_VANTAGE_API_KEY
      }
    });

    if (response.data.Information && response.data.Information.includes('API call frequency')) {
      return res.status(429).json({ message: 'API rate limit reached' });
    }

    res.json(response.data);
  } catch (error) {
    console.error('Alpha Vantage API error:', error);
    res.status(500).json({ message: 'Error fetching stock data' });
  }
});

// NewsData.io API endpoint - Public route
router.get('/news', async (req, res) => {
  try {
    const response = await axios.get('https://newsdata.io/api/1/news', {
      params: {
        apikey: process.env.NEWSDATA_API_KEY,
        category: 'technology',
        language: 'en',
        size: 5 // Limit to 5 news items
      }
    });

    // Ensure we have a valid response structure
    if (!response.data || !response.data.results) {
      throw new Error('Invalid response from NewsData API');
    }

    res.json(response.data);
  } catch (error) {
    console.error('NewsData API error:', error);
    res.status(500).json({ 
      message: 'Error fetching news data',
      results: [] // Ensure we always return a results array
    });
  }
});

export default router; 