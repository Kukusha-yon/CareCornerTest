/**
 * Token helper utility functions
 */

// Check if token exists
export const hasToken = () => {
  return !!localStorage.getItem('token');
};

// Debug token expiration
export const checkToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return { valid: false, error: 'No token found' };
    }

    // Extract token payload
    const payload = token.split('.')[1];
    if (!payload) {
      console.error('Invalid token format');
      return { valid: false, error: 'Invalid token format' };
    }

    // Decode the base64 payload
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check expiration
    const expiryTime = decodedPayload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const isExpired = currentTime > expiryTime;
    
    if (isExpired) {
      console.error('Token has expired', {
        expired: new Date(expiryTime).toISOString(),
        now: new Date(currentTime).toISOString(),
        timeLeft: (expiryTime - currentTime) / 1000 / 60 + ' minutes'
      });
      return { valid: false, error: 'Token expired', expiryTime, currentTime };
    }
    
    return { 
      valid: true, 
      expiryTime, 
      timeLeft: (expiryTime - currentTime) / 1000 / 60 + ' minutes',
      user: decodedPayload.sub || decodedPayload.id || null
    };
  } catch (error) {
    console.error('Error checking token:', error);
    return { valid: false, error: error.message };
  }
};

// Force token refresh - no longer attempts to call refreshToken function
export const forceRefreshToken = async () => {
  try {
    // Manual approach: clear token and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login if not already there
    if (window.location && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    
    return { success: false, error: 'Token refresh no longer supported. Please log in again.' };
  } catch (error) {
    console.error('Failed to handle token refresh:', error);
    return { success: false, error: error.message };
  }
}; 