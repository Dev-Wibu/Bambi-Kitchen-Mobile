/**
 * Currency formatting utilities
 * All prices in the system are stored in minor units (cents/VND)
 */

/**
 * Format a price in minor units to VND currency string
 * @param cents - Price in minor units (1 VND = 1 unit, e.g., 100000 = 100,000 VND)
 * @returns Formatted string like "100,000 VND"
 */
export const formatMoney = (cents: number): string => {
  // Convert cents to major unit (divide by 100)
  const amount = cents / 100;
  
  // Format with thousand separators and no decimals (VND doesn't use decimals)
  return `${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} VND`;
};

/**
 * Format a price in minor units to VND currency string (short version without decimals)
 * @param cents - Price in minor units
 * @returns Formatted string like "100,000đ"
 */
export const formatMoneyShort = (cents: number): string => {
  const amount = cents / 100;
  return `${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}đ`;
};

/**
 * Parse a VND string back to cents
 * @param vndString - String like "100,000 VND" or "100,000đ"
 * @returns Price in minor units (cents)
 */
export const parseMoney = (vndString: string): number => {
  // Remove all non-digit characters except decimal point
  const cleaned = vndString.replace(/[^\d.]/g, '');
  const amount = parseFloat(cleaned) || 0;
  // Convert to cents
  return Math.round(amount * 100);
};
