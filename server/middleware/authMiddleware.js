import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../config/jwt.js';

// @desc    Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token using our new JWT utility
      const decoded = verifyToken(token);

      // Get user from the token
      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
        throw new AppError('Not authorized, user not found', 401);
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      throw new AppError(error.message, 401);
    }
  } else {
    throw new AppError('Not authorized, no token', 401);
  }
});

// @desc    Admin middleware
export const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    throw new AppError('Not authorized as an admin', 403);
  }
}); 