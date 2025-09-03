/**
 * Address validation utilities
 * 
 * Handles postal code formatting and city normalization for NL addresses.
 */

/**
 * Normalize Dutch postal code to 1234 AB format
 * @param str - Raw postal code string
 * @returns Normalized postal code or empty string if invalid
 */
export function normalizePostalCodeNL(str: string): string {
  if (!str) return '';
  
  // Remove all non-alphanumeric characters
  const cleaned = str.replace(/[^0-9A-Za-z]/g, '');
  
  // Check if it matches NL postal code pattern (4 digits + 2 letters)
  const match = cleaned.match(/^(\d{4})([A-Za-z]{2})$/);
  if (!match) return '';
  
  const [, digits, letters] = match;
  return `${digits} ${letters.toUpperCase()}`;
}

/**
 * Validate Dutch postal code format
 * @param str - Postal code string to validate
 * @returns True if valid NL postal code format
 */
export function isValidPostalCodeNL(str: string): boolean {
  if (!str) return false;
  
  // Remove spaces, dashes, and other separators and check pattern
  const cleaned = str.replace(/[\s\-]/g, '');
  return /^[0-9]{4}[A-Za-z]{2}$/.test(cleaned);
}

/**
 * Normalize city name (title case, trim whitespace)
 * @param str - Raw city name
 * @returns Normalized city name
 */
export function normalizeCity(str: string): string {
  if (!str) return '';
  
  return str
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Validate required address fields
 * @param address - Address object
 * @returns True if all required fields are present and valid
 */
export function validateAddress(address: {
  street?: string;
  house_number?: string;
  postal_code?: string;
  city?: string;
}): boolean {
  return !!(
    address.street?.trim() &&
    address.house_number?.trim() &&
    isValidPostalCodeNL(address.postal_code || '') &&
    address.city?.trim()
  );
}
