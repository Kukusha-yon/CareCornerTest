import axios from 'axios';
import { toast } from 'react-hot-toast';

class ApiError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

const baseURL = import.meta.env.VITE_API_URL || '/api';

// List of public routes that don't require authentication
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/products',
  '/products/category',
  '/featured-products',
  '/partners',
  '/new-arrivals',
  '/market-news'
];

// Routes that specifically require admin access
const adminRoutes = [
  '/admin/',
  '/new-arrivals/admin',
  '/products/admin'
];

// Create axios instance with base URL
const api = axios.create({
  baseURL,
  timeout: 10000,
});

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    // Ensure URL starts with / for consistency
    if (!config.url.startsWith('/')) {
      config.url = '/' + config.url;
    }
    
    // Check if this is a public route that doesn't need authorization
    const isPublicRoute = publicRoutes.some(route => config.url.includes(route));
    
    // Check if it's an admin route which always needs a token
    const isAdminRoute = adminRoutes.some(route => config.url.includes(route));
    
    if (!isPublicRoute || isAdminRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // For admin routes, we can immediately reject if there's no token
        if (isAdminRoute) {
          const error = new Error('Authentication required');
          error.config = config;
          error.response = {
            status: 401,
            data: { message: 'No authentication token found' }
          };
          return Promise.reject(error);
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Debounce error notifications to prevent too many toasts
let lastErrorTime = 0;
let lastErrorMessage = '';
const ERROR_COOLDOWN = 5000; // 5 seconds between similar errors

const showErrorNotification = (message) => {
  const now = Date.now();
  // Only show error if it's a different message or it's been more than 5 seconds
  if (message !== lastErrorMessage || now - lastErrorTime > ERROR_COOLDOWN) {
    toast.error(message);
    lastErrorMessage = message;
    lastErrorTime = now;
  }
};

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if logging should be suppressed
    const suppressLogging = error.config?.errorHandling?.suppressLogging;
    
    // Don't log to console if suppressLogging is true (for expected errors like 404s)
    if (!suppressLogging) {
      // Handle specific error types with custom console grouping
      if (error.response) {
        const status = error.response.status;
        const url = error.config?.url || 'unknown endpoint';
        
        if (status !== 404 || !url.includes('featured-products/product')) {
          // Only log non-404 errors or 404s that aren't for featured products
          // We do this silently in the background for expected cases
        }
      }
    }
    
    // Handle database connection errors
    if (error.response && error.response.status === 503) {
      // Store information about the last request that failed
      const requestInfo = {
        url: error.config.url,
        method: error.config.method,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('lastFailedRequest', JSON.stringify(requestInfo));
      
      // Display a user-friendly message
      if (error.config.showErrorToast !== false) {
        showErrorNotification('The server is experiencing temporary database connectivity issues. Please try again in a few moments.');
      }
      
      // Add additional information to the error for component-level handling
      error.isDbConnectionError = true;
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED' || !error.response) {
      // Display a user-friendly message
      if (error.config.showErrorToast !== false) {
        showErrorNotification('Unable to connect to the server. Please check your internet connection and try again.');
      }
    }
      
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear localStorage and redirect to login
      if (error.response.data.message === 'Token expired' || 
          error.response.data.message === 'Invalid token' ||
          error.response.data.message === 'No authentication token found') {
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Check if we're already on the login page to avoid redirect loops
        if (!window.location.pathname.includes('/login')) {
          // If it's an XHR request, we don't want to redirect directly
          if (!error.config?.showErrorToast === false) {
            showErrorNotification('Your session has expired. Please log in again.');
          }
          
          // Set a flag to indicate auth error for component handling
          error.isAuthError = true;
        }
      }
    }
    
    // Handle not found errors specifically
    if (error.response && error.response.status === 404) {
      // We'll let the individual components handle 404 errors
    }
    
    return Promise.reject(error);
  }
);

export default api; 