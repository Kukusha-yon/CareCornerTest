/**
 * Get the authorization header with the JWT token from localStorage
 * @returns {Object} The authorization header object
 */
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}; 