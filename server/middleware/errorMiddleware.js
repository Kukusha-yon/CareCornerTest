import { AppError } from '../utils/AppError.js';

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let error = err;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    error = Object.values(err.errors).map(val => val.message);
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.name === 'MongoServerError') {
    if (err.message.includes('bad auth')) {
      statusCode = 500;
      message = 'Database authentication failed';
      error = 'Please check your MongoDB credentials and IP whitelist';
    } else if (err.message.includes('timeout')) {
      statusCode = 504;
      message = 'Database operation timed out';
      error = 'The database operation took too long to complete';
    }
  } else if (err.name === 'MongoNetworkError') {
    statusCode = 503;
    message = 'Database connection error';
    error = 'Unable to connect to the database. Please try again later';
  }

  // Send error response
  res.status(statusCode).json({
      success: false,
    message,
    error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
}; 