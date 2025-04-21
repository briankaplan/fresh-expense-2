import { describe, it, expect } from 'vitest';
import { truncateString } from '../string.utils';

describe('String Utils', () => {
    describe('truncateString', () => {
        it('should truncate strings longer than max length', () => {
            expect(truncateString('Hello World', 5)).toBe('Hello...');
            expect(truncateString('Hello World', 8)).toBe('Hello Wo...');
        });

        it('should not truncate strings shorter than max length', () => {
            expect(truncateString('Hello', 10)).toBe('Hello');
        });

        it('should handle empty strings', () => {
            expect(truncateString('', 5)).toBe('');
        });
    });
}); 