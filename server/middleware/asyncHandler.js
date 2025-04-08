/**
 * Wrapper function to handle async operations in Express routes
 * Eliminates the need for try/catch blocks in route handlers
 * @param {Function} fn - The async function to wrap
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
}; 