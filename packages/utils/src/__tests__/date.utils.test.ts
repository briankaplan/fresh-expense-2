import { describe, it, expect } from 'vitest';
import {
    formatDate,
    parseDate,
    isValidDate,
    addDaysToDate,
    subtractDaysFromDate,
    daysBetweenDates,
    isDateInRange,
    getCurrentISODate,
    getStartOfMonth,
    getEndOfMonth
} from '../date.utils';

describe('Date Utils', () => {
    describe('formatDate', () => {
        it('should format dates correctly', () => {
            const date = new Date('2023-01-15T00:00:00Z');
            expect(formatDate(date)).toBe('Jan 15, 2023');
            expect(formatDate(date, 'MM/dd/yyyy')).toBe('01/15/2023');

            // Test with a date that would cross timezone boundaries
            const date2 = new Date('2023-01-15T23:00:00Z');
            expect(formatDate(date2)).toBe('Jan 15, 2023');
        });

        it('should handle string inputs', () => {
            expect(formatDate('2023-01-15')).toBe('Jan 15, 2023');
            expect(formatDate('2023-01-15T23:00:00Z')).toBe('Jan 15, 2023');
        });
    });

    describe('parseDate', () => {
        it('should parse valid date strings', () => {
            const date = parseDate('2023-01-15');
            expect(date).toBeInstanceOf(Date);
            expect(date.getUTCFullYear()).toBe(2023);
            expect(date.getUTCMonth()).toBe(0); // January is 0
            expect(date.getUTCDate()).toBe(15);
        });

        it('should throw error for invalid dates', () => {
            expect(() => parseDate('invalid')).toThrow('Invalid date string');
        });
    });

    describe('isValidDate', () => {
        it('should validate correct date strings', () => {
            expect(isValidDate('2023-01-15')).toBe(true);
        });

        it('should reject invalid date strings', () => {
            expect(isValidDate('invalid')).toBe(false);
            expect(isValidDate('2023-13-45')).toBe(false);
        });
    });

    describe('addDaysToDate', () => {
        it('should add days correctly', () => {
            const date = new Date('2023-01-15');
            const result = addDaysToDate(date, 5);
            expect(result.getUTCDate()).toBe(20);
        });

        it('should handle string inputs', () => {
            const result = addDaysToDate('2023-01-15', 5);
            expect(result.getUTCDate()).toBe(20);
        });
    });

    describe('subtractDaysFromDate', () => {
        it('should subtract days correctly', () => {
            const date = new Date('2023-01-15');
            const result = subtractDaysFromDate(date, 5);
            expect(result.getUTCDate()).toBe(10);
        });

        it('should handle string inputs', () => {
            const result = subtractDaysFromDate('2023-01-15', 5);
            expect(result.getUTCDate()).toBe(10);
        });
    });

    describe('daysBetweenDates', () => {
        it('should calculate days between dates correctly', () => {
            const start = new Date('2023-01-01');
            const end = new Date('2023-01-10');
            expect(daysBetweenDates(start, end)).toBe(9);
        });

        it('should handle string inputs', () => {
            expect(daysBetweenDates('2023-01-01', '2023-01-10')).toBe(9);
        });
    });

    describe('isDateInRange', () => {
        it('should check if date is in range', () => {
            const date = new Date('2023-01-15');
            const start = new Date('2023-01-01');
            const end = new Date('2023-01-31');
            expect(isDateInRange(date, start, end)).toBe(true);
        });

        it('should handle string inputs', () => {
            expect(isDateInRange('2023-01-15', '2023-01-01', '2023-01-31')).toBe(true);
        });
    });

    describe('getCurrentISODate', () => {
        it('should return current date in ISO format', () => {
            const result = getCurrentISODate();
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });

    describe('getStartOfMonth', () => {
        it('should get start of month correctly', () => {
            const date = new Date('2023-01-15');
            const result = getStartOfMonth(date);
            expect(result.getDate()).toBe(1);
            expect(result.getMonth()).toBe(0);
        });
    });

    describe('getEndOfMonth', () => {
        it('should get end of month correctly', () => {
            const date = new Date('2023-01-15');
            const result = getEndOfMonth(date);
            expect(result.getDate()).toBe(31);
            expect(result.getMonth()).toBe(0);
        });
    });
}); 