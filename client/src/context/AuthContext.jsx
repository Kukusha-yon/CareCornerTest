import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentUser as getCurrentUserService,
  login as loginService,
  register as registerService,
  logout as logoutService,
  updateProfile as updateProfileService,
  refreshToken as refreshTokenService
} from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenRefreshing, setTokenRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Create a timeout to prevent hanging in loading state
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Authentication check timed out')), 5000);
      });

      // Race between actual auth check and timeout
      const user = await Promise.race([
        getCurrentUserService(),
        timeoutPromise
      ]);

      if (user && user._id) {
        setUser(user);
      } else {
        // Clear invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      // Clear tokens on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    if (tokenRefreshing) return; // Prevent multiple simultaneous refresh attempts
    
    try {
      setTokenRefreshing(true);
      const response = await refreshTokenService();
      
      if (response && response.accessToken) {
        localStorage.setItem('token', response.accessToken);
        // Optionally update the user data if returned
        if (response.user) {
          setUser(response.user);
        }
        return true;
      }
      return false;
    } catch (error) {
      // If refresh fails, log the user out
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return false;
    } finally {
      setTokenRefreshing(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await loginService(email, password);
      
      // Ensure we have a valid user object with role before setting state
      if (response && response._id && response.role) {
        setUser(response);
        return response;
      } else {
        throw new Error('Invalid user data received from server');
      }
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await registerService(userData);
      // Don't set the user or tokens here, just return success
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutService();
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      // Force logout even if the server call fails
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Failed to logout properly. Local session cleared.');
      navigate('/login');
    }
  };

  const updateProfile = async (userData) => {
    try {
      const updatedUser = await updateProfileService(userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      if (error.response?.status === 401) {
        // Try to refresh token once
        const refreshed = await refreshToken();
        if (refreshed) {
          // Retry the update with fresh token
          const updatedUser = await updateProfileService(userData);
          setUser(updatedUser);
          return updatedUser;
        } else {
          logout();
          throw new Error('Your session expired. Please log in again.');
        }
      }
      throw error;
    }
  };

  // Simplified password change function that just shows a toast message
  const changePassword = async (passwordData) => {
    try {
      toast.success('Password change functionality is currently unavailable');
      return { success: false, message: 'Password change functionality is currently unavailable' };
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 