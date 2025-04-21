import { describe, it, expect } from 'vitest';
import { formatCurrency, parseCurrency, isValidCurrency } from '../currency.utils';

describe('Currency Utils', () => {
    describe('formatCurrency', () => {
        it('should format positive numbers correctly', () => {
            expect(formatCurrency(1000)).toBe('$1,000.00');
            expect(formatCurrency(1000.5)).toBe('$1,000.50');
            expect(formatCurrency(1000.55)).toBe('$1,000.55');
        });

        it('should format negative numbers correctly', () => {
            expect(formatCurrency(-1000)).toBe('-$1,000.00');
            expect(formatCurrency(-1000.5)).toBe('-$1,000.50');
        });

        it('should handle zero correctly', () => {
            expect(formatCurrency(0)).toBe('$0.00');
        });

        it('should handle different currencies', () => {
            expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
            expect(formatCurrency(1000, 'GBP')).toBe('£1,000.00');
        });
    });

    describe('parseCurrency', () => {
        it('should parse valid currency strings', () => {
            expect(parseCurrency('$1,000.00')).toBe(1000);
            expect(parseCurrency('$1,000.50')).toBe(1000.5);
            expect(parseCurrency('-$1,000.00')).toBe(-1000);
        });

        it('should handle different currency symbols', () => {
            expect(parseCurrency('€1,000.00')).toBe(1000);
            expect(parseCurrency('£1,000.00')).toBe(1000);
        });

        it('should return NaN for invalid inputs', () => {
            expect(parseCurrency('invalid')).toBeNaN();
            expect(parseCurrency('$invalid')).toBeNaN();
        });
    });

    describe('isValidCurrency', () => {
        it('should validate correct currency strings', () => {
            expect(isValidCurrency('$1,000.00')).toBe(true);
            expect(isValidCurrency('$1,000.50')).toBe(true);
            expect(isValidCurrency('-$1,000.00')).toBe(true);
        });

        it('should reject invalid currency strings', () => {
            expect(isValidCurrency('invalid')).toBe(false);
            expect(isValidCurrency('$invalid')).toBe(false);
            expect(isValidCurrency('$1,000.000')).toBe(false); // Too many decimal places
        });
    });
}); 