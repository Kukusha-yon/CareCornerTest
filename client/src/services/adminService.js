import api from './api';

class AdminServiceError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = {}) {
    super(message);
    this.name = 'AdminServiceError';
    this.code = code;
    this.details = details;
  }
}

// Remove mock data and use real data from the backend
export const getDashboardData = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new AdminServiceError(
        error.response.data.message || 'Failed to fetch dashboard data',
        'FETCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new AdminServiceError(
      'Network error while fetching dashboard data',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const getStats = async (timeRange = 'week') => {
  try {
    const response = await api.get(`/admin/stats?timeRange=${timeRange}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new AdminServiceError(
        error.response.data.message || 'Failed to fetch stats',
        'FETCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new AdminServiceError(
      'Network error while fetching stats',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const getAnalytics = async (timeRange = 'week') => {
  try {
    const response = await api.get(`/admin/analytics?timeRange=${timeRange}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new AdminServiceError(
        error.response.data.message || 'Failed to fetch analytics',
        'FETCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new AdminServiceError(
      'Network error while fetching analytics',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const getUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new AdminServiceError(
        error.response.data.message || 'Failed to fetch users',
        'FETCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new AdminServiceError(
      'Network error while fetching users',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new AdminServiceError(
        error.response.data.message || 'Failed to update user status',
        'UPDATE_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new AdminServiceError(
      'Network error while updating user status',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new AdminServiceError(
        error.response.data.message || 'Failed to update user role',
        'UPDATE_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new AdminServiceError(
      'Network error while updating user role',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const deleteUser = async (userId) => {
  try {
    console.log('Deleting user with ID:', userId);
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new AdminServiceError(
        error.response.data.message || 'Failed to delete user',
        'DELETE_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new AdminServiceError(
      'Network error while deleting user',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const getOrderStats = async (timeRange = 'week') => {
  try {
    const response = await api.get(`/admin/orders/stats?timeRange=${timeRange}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new AdminServiceError(
        error.response.data.message || 'Failed to fetch order stats',
        'FETCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new AdminServiceError(
      'Network error while fetching order stats',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const getProductStats = async (timeRange = 'week') => {
  try {
    const response = await api.get(`/admin/products/stats?timeRange=${timeRange}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new AdminServiceError(
        error.response.data.message || 'Failed to fetch product stats',
        'FETCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new AdminServiceError(
      'Network error while fetching product stats',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const getCustomerStats = async (timeRange = 'week') => {
  try {
    const response = await api.get(`/admin/customers/stats?timeRange=${timeRange}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new AdminServiceError(
        error.response.data.message || 'Failed to fetch customer stats',
        'FETCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new AdminServiceError(
      'Network error while fetching customer stats',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const getSettings = async () => {
  try {
    const response = await api.get('/admin/settings');
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new AdminServiceError(
        error.response.data.message || 'Failed to fetch settings',
        'FETCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new AdminServiceError(
      'Network error while fetching settings',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const updateSettings = async (data) => {
  try {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    const response = await api.put('/admin/settings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new AdminServiceError(
        error.response.data.message || 'Failed to update settings',
        'UPDATE_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new AdminServiceError(
      'Network error while updating settings',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new AdminServiceError(
        error.response.data.message || 'Failed to create user',
        'CREATE_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new AdminServiceError(
      'Network error while creating user',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
  }
};

// Get recent orders
export const getRecentOrders = async () => {
  try {
    const response = await api.get('/admin/orders/recent');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch recent orders');
  }
};

// Get sales data
export const getSalesData = async (period = 'week') => {
  try {
    const response = await api.get(`/admin/sales?period=${period}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sales data');
  }
};

// Get customer data
export const getCustomerData = async () => {
  try {
    const response = await api.get('/admin/customers');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customer data');
  }
}; 