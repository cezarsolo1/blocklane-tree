import { describe, it, expect } from 'vitest';
import { 
  normalizePostalCodeNL, 
  isValidPostalCodeNL, 
  normalizeCity, 
  validateAddress 
} from '@/modules/validation/address';

describe('Address Validation', () => {
  describe('normalizePostalCodeNL', () => {
    it('should normalize valid postal codes', () => {
      expect(normalizePostalCodeNL('1234AB')).toBe('1234 AB');
      expect(normalizePostalCodeNL('1234 ab')).toBe('1234 AB');
      expect(normalizePostalCodeNL('1234-ab')).toBe('1234 AB');
      expect(normalizePostalCodeNL('1234 ab')).toBe('1234 AB');
    });

    it('should return empty string for invalid postal codes', () => {
      expect(normalizePostalCodeNL('12345AB')).toBe('');
      expect(normalizePostalCodeNL('123AB')).toBe('');
      expect(normalizePostalCodeNL('1234A')).toBe('');
      expect(normalizePostalCodeNL('')).toBe('');
      expect(normalizePostalCodeNL('invalid')).toBe('');
    });
  });

  describe('isValidPostalCodeNL', () => {
    it('should validate correct NL postal codes', () => {
      expect(isValidPostalCodeNL('1234AB')).toBe(true);
      expect(isValidPostalCodeNL('1234 ab')).toBe(true);
      expect(isValidPostalCodeNL('1234-AB')).toBe(true);
      expect(isValidPostalCodeNL('0000AA')).toBe(true);
      expect(isValidPostalCodeNL('9999ZZ')).toBe(true);
    });

    it('should reject invalid postal codes', () => {
      expect(isValidPostalCodeNL('12345AB')).toBe(false);
      expect(isValidPostalCodeNL('123AB')).toBe(false);
      expect(isValidPostalCodeNL('1234A')).toBe(false);
      expect(isValidPostalCodeNL('')).toBe(false);
      expect(isValidPostalCodeNL('invalid')).toBe(false);
    });
  });

  describe('normalizeCity', () => {
    it('should normalize city names to title case', () => {
      expect(normalizeCity('amsterdam')).toBe('Amsterdam');
      expect(normalizeCity('NEW YORK')).toBe('New York');
      expect(normalizeCity('rotterdam')).toBe('Rotterdam');
      expect(normalizeCity('  utrecht  ')).toBe('Utrecht');
      expect(normalizeCity('den haag')).toBe('Den Haag');
    });

    it('should handle empty input', () => {
      expect(normalizeCity('')).toBe('');
    });
  });

  describe('validateAddress', () => {
    it('should validate complete addresses', () => {
      const validAddress = {
        street: 'Main Street',
        house_number: '123',
        postal_code: '1234AB',
        city: 'Amsterdam'
      };
      expect(validateAddress(validAddress)).toBe(true);
    });

    it('should reject incomplete addresses', () => {
      expect(validateAddress({
        street: 'Main Street',
        house_number: '123',
        postal_code: '1234AB',
        city: ''
      })).toBe(false);

      expect(validateAddress({
        street: '',
        house_number: '123',
        postal_code: '1234AB',
        city: 'Amsterdam'
      })).toBe(false);

      expect(validateAddress({
        street: 'Main Street',
        house_number: '',
        postal_code: '1234AB',
        city: 'Amsterdam'
      })).toBe(false);

      expect(validateAddress({
        street: 'Main Street',
        house_number: '123',
        postal_code: 'invalid',
        city: 'Amsterdam'
      })).toBe(false);
    });

    it('should handle whitespace correctly', () => {
      expect(validateAddress({
        street: '  Main Street  ',
        house_number: '  123  ',
        postal_code: '1234AB',
        city: '  Amsterdam  '
      })).toBe(true);
    });
  });
});
