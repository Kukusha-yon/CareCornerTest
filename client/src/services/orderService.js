import api from './api';
import axios from 'axios';

class OrderServiceError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = {}) {
    super(message);
    this.name = 'OrderServiceError';
    this.code = code;
    this.details = details;
  }
}

// Get user orders
export const getUserOrders = async () => {
  try {
    const response = await api.get('orders/user');
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new OrderServiceError(
        error.response.data.message || 'Failed to fetch user orders',
        'FETCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new OrderServiceError(
      'Network error while fetching user orders',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

// Get all orders (admin only)
export const getAllOrders = async () => {
  try {
    const response = await api.get('orders');
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new OrderServiceError(
        error.response.data.message || 'Failed to fetch all orders',
        'FETCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new OrderServiceError(
      'Network error while fetching all orders',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create order
export const createOrder = async (orderData) => {
  try {
    // Validate token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new OrderServiceError('Authentication required', 'AUTH_ERROR');
    }
    
    // Make sure shippingDetails are provided
    if (!orderData.shippingDetails || !orderData.items || !orderData.paymentMethod) {
      throw new OrderServiceError('Missing required order data', 'VALIDATION_ERROR');
    }
    
    // Important: Use the correct endpoint - ensure it matches the server route
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    // If error is already an OrderServiceError, just throw it
    if (error instanceof OrderServiceError) {
      throw error;
    }
    
    // Handle axios errors
    if (error.response) {
      // Request was made and server responded with error status
      const status = error.response.status;
      const url = error.config?.url;
      const message = error.response.data?.message || 'Failed to create order';
      
      // Check for specific product not found error
      if (status === 404 && message.includes('Product') && message.includes('not found')) {
        throw new OrderServiceError(
          'One or more products in your cart are no longer available.',
          'PRODUCT_NOT_FOUND',
          { status, url, data: error.response.data }
        );
      } else if (status === 401) {
        throw new OrderServiceError(
          'Authentication required. Please log in again.',
          'AUTH_ERROR',
          { status, url }
        );
      } else if (status === 404) {
        throw new OrderServiceError(
          'Order service is unavailable. Please try again later.',
          'NOT_FOUND_ERROR',
          { status, url }
        );
      } else {
        throw new OrderServiceError(
          message,
          'API_ERROR',
          { status, data: error.response.data }
        );
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      throw new OrderServiceError(
        'Could not connect to the order service. Please check your internet connection.',
        'NETWORK_ERROR'
      );
    } else {
      // Something else happened
      throw new OrderServiceError(
        error.message || 'An unexpected error occurred',
        'UNEXPECTED_ERROR'
      );
    }
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new OrderServiceError(
        error.response.data.message || 'Failed to update order status',
        'UPDATE_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new OrderServiceError(
      'Network error while updating order status',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

// Get order statistics (admin only)
export const getOrderStats = async (timeRange = 'week') => {
  try {
    const response = await api.get(`admin/orders/stats?timeRange=${timeRange}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const response = await api.delete(`orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete order');
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await api.post(`orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to cancel order');
  }
}; 