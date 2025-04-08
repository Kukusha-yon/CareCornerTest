import api from './api.js';

// Authentication service for user-related operations
export const login = async (email, password) => {
  try {
    // Ensure email and password are sent as separate properties
    const loginData = {
      email: email,
      password: password
    };
    
    const response = await api.post('/auth/login', loginData);
    
    if (response.data && response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data && response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch (error) {
      return null;
    }
  }
  return null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/auth/profile', userData);
    if (response.data) {
      // Update the user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const currentToken = localStorage.getItem('token');
    
    if (!currentToken) {
      throw new Error('No token available to refresh');
    }
    
    const response = await api.post('/auth/refresh-token', {
      // Some implementations might need the current token or refresh token
      token: currentToken
    });
    
    if (response.data && response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      
      // If user data is also returned, update it
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } else {
      throw new Error('Invalid response from refresh token endpoint');
    }
  } catch (error) {
    // Clear tokens if refresh fails
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw error;
  }
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
  getToken,
  updateProfile,
  forgotPassword,
  resetPassword,
  refreshToken
}; 