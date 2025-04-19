import { describe, it, expect } from 'vitest';

import {
  generateToken,
  verifyToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
} from '../jwt-helpers';

describe('JWT Helpers', () => {
  const testSecret = 'test-secret';
  const testUserId = '123';

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken({ userId: testUserId }, testSecret, { expiresIn: '1h' });
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should throw error if secret is missing', () => {
      expect(() => generateToken({ userId: testUserId }, '', { expiresIn: '1h' })).toThrow(
        'JWT secret is required',
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const token = generateToken({ userId: testUserId }, testSecret, { expiresIn: '1h' });
      const decoded = verifyToken(token, testSecret);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testUserId);
    });

    it('should throw error if token is missing', () => {
      expect(() => verifyToken('', testSecret)).toThrow('Token is required');
    });

    it('should throw error if secret is missing', () => {
      const token = generateToken({ userId: testUserId }, testSecret, { expiresIn: '1h' });
      expect(() => verifyToken(token, '')).toThrow('JWT secret is required');
    });
  });

  describe('generateEmailVerificationToken', () => {
    it('should generate a valid email verification token', () => {
      const token = generateEmailVerificationToken(testUserId, testSecret);
      const decoded = verifyToken(token, testSecret);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testUserId);
    });
  });

  describe('generatePasswordResetToken', () => {
    it('should generate a valid password reset token', () => {
      const token = generatePasswordResetToken(testUserId, testSecret);
      const decoded = verifyToken(token, testSecret);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testUserId);
    });
  });
});
