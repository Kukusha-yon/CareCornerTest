/**
 * Ensures that an ID is always in the correct string format
 * Handles different kinds of MongoDB ID representations
 * 
 * @param {string|object} id - The ID which may be a string, object, or stringified object
 * @returns {string} A properly formatted string ID
 */
export function ensureStringId(id) {
  if (!id) return '';
  
  // If id is a string that looks like a stringified object, try to parse it
  if (typeof id === 'string' && (id.startsWith('{') || id.includes('_id'))) {
    try {
      const parsed = JSON.parse(id);
      if (parsed && parsed._id) {
        return parsed._id;
      }
    } catch (e) {
      // Not a valid JSON, just return the original string
    }
  }
  
  // If id is an object with _id property, return that
  if (typeof id === 'object' && id !== null) {
    if (id._id) return id._id;
    // If it's a MongoDB ObjectID, it might have a toString method
    if (typeof id.toString === 'function') {
      const str = id.toString();
      // Only return if it looks like a MongoDB ID (not just the default Object.toString())
      if (str !== '[object Object]') return str;
    }
  }
  
  // Return the id as a string
  return String(id);
} 