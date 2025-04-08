/**
 * Formats a number as an Ethiopian Birr (ETB) currency value
 * @param {number} amount - The amount to format
 * @param {number} decimals - The number of decimal places to include (default: 2)
 * @returns {string} The formatted currency string with ETB symbol
 */
export const formatCurrency = (amount, decimals = 2) => {
  if (amount === undefined || amount === null) {
    return 'ETB 0.00';
  }
  
  // Format with the specified number of decimal places
  const formattedAmount = Number(amount).toFixed(decimals);
  
  // Add the ETB symbol and return
  return `ETB ${formattedAmount}`;
};

export default formatCurrency;

/**
 * Formats a number as a percentage
 * @param {number} value - The value to format
 * @param {number} [decimals=0] - Number of decimal places
 * @returns {string} The formatted percentage string
 */
export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) return '';
  
  return new Intl.NumberFormat('en-ET', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
}; 