import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';
import rateLimit from 'express-rate-limit';
import admin from '../config/firebase.js';

// Constants for login attempts
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

// Create rate limiter using in-memory storage
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts. Please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Token generation functions
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      role: user.role 
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// Password complexity check
const isPasswordComplex = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    
    // Extract email and password from request body
    let email, password;
    
    if (typeof req.body === 'object' && req.body !== null) {
      // If req.body is an object, extract email and password properties
      email = req.body.email;
      password = req.body.password;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid request format' });
    }
    
    console.log('Login attempt for email:', email);

    // Find user and explicitly select the password field
    const user = await User.findOne({ email: email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      return res.status(403).json({ 
        message: 'Account is locked. Please try again later.',
        lockUntil: user.lockUntil
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment failed attempts
      user.failedLoginAttempts += 1;
      
      // Lock account if too many failed attempts
      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.isLocked = true;
        user.lockUntil = Date.now() + LOCK_TIME;
      }
      
      await user.save();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.isLocked = false;
    user.lockUntil = null;
    await user.save();

    // Auto-verify email if not verified
    if (!user.isEmailVerified) {
      console.log('Auto-verifying email for user:', email);
      user.isEmailVerified = true;
      await user.save();
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken
    };

    console.log('Login successful for user:', email, 'Role:', user.role);
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    
    // Extract user data from request body
    let name, email, password;
    
    if (typeof req.body === 'object' && req.body !== null) {
      name = req.body.name;
      email = req.body.email;
      password = req.body.password;
      
      if (!name || !email || !password) {
        // Handle missing required fields
        return res.status(400).json({ 
          message: 'All fields are required',
          errors: {
            name: !req.body.name ? 'Name is required' : undefined,
            email: !req.body.email ? 'Email is required' : undefined,
            password: !req.body.password ? 'Password is required' : undefined
          }
        });
      }
    } else {
      return res.status(400).json({ message: 'Invalid request format' });
    }
    
    console.log('Registration attempt for email:', email);

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long',
        errors: { password: 'Password must be at least 8 characters long' }
      });
    }

    // Validate name length
    if (name.length < 2) {
      return res.status(400).json({ 
        message: 'Name must be at least 2 characters long',
        errors: { name: 'Name must be at least 2 characters long' }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Please enter a valid email address',
        errors: { email: 'Please enter a valid email address' }
      });
    }

    // Validate password complexity
    if (!isPasswordComplex(password)) {
      return res.status(400).json({
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res.status(400).json({ 
        message: 'User already exists',
        errors: { email: 'This email is already registered' }
      });
    }

    // Create user with email already verified
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      isEmailVerified: true // Auto-verify email since we're not sending verification emails
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
      message: 'Registration successful. You can now log in.'
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Register error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: 'An error occurred during registration' });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'An error occurred during email verification' });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user in our database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token using the model method
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?oobCode=${resetToken}`;
    
    // Log the reset URL (for development only)
    console.log('Password reset URL:', resetUrl);

    res.json({ 
      message: 'Password reset email sent',
      resetUrl // Only in development, remove in production
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'An error occurred while processing your request',
      error: error.message 
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { oobCode, newPassword } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: oobCode,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ 
      message: 'Invalid or expired reset token',
      error: error.message 
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({ 
      _id: decoded.userId,
      refreshToken 
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '15m',
        algorithm: 'HS256'
      }
    );

    res.json({
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'An error occurred during logout' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'An error occurred while fetching user data' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;
    const userId = req.user._id;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          message: 'Please enter a valid email address',
          errors: { email: 'Please enter a valid email address' }
        });
      }
    }

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ 
          message: 'Email already in use',
          errors: { email: 'This email is already registered' }
        });
      }
    }

    // Update user profile
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        name,
        email,
        phoneNumber
      },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: 'An error occurred while updating profile' });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Validate password length
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: 'New password must be at least 8 characters long',
        errors: { newPassword: 'Password must be at least 8 characters long' }
      });
    }

    // Get user with password field
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: 'An error occurred while changing password' });
  }
}; 