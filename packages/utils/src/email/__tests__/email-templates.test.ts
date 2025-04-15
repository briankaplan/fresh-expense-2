import { describe, it, expect } from 'vitest';
import {
  generateVerificationEmailContent,
  generatePasswordResetEmailContent,
  generateVerificationLink,
  generatePasswordResetLink,
} from '../email-templates';

describe('Email Templates', () => {
  const baseUrl = 'https://example.com';
  const token = 'test-token';

  describe('generateVerificationLink', () => {
    it('should generate correct verification link', () => {
      const link = generateVerificationLink(baseUrl, token);
      expect(link).toBe(`${baseUrl}/verify-email?token=${token}`);
    });
  });

  describe('generatePasswordResetLink', () => {
    it('should generate correct password reset link', () => {
      const link = generatePasswordResetLink(baseUrl, token);
      expect(link).toBe(`${baseUrl}/reset-password?token=${token}`);
    });
  });

  describe('generateVerificationEmailContent', () => {
    it('should generate verification email HTML content', () => {
      const link = generateVerificationLink(baseUrl, token);
      const content = generateVerificationEmailContent(link);
      expect(content).toContain('Welcome to Fresh Expense!');
      expect(content).toContain(link);
      expect(content).toContain('24 hours');
    });
  });

  describe('generatePasswordResetEmailContent', () => {
    it('should generate password reset email HTML content', () => {
      const link = generatePasswordResetLink(baseUrl, token);
      const content = generatePasswordResetEmailContent(link);
      expect(content).toContain('Password Reset Request');
      expect(content).toContain(link);
      expect(content).toContain('1 hour');
      expect(content).toContain('ignore this email');
    });
  });
});
