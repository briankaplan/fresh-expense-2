import * as jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  [key: string]: any;
}

export interface TokenOptions {
  expiresIn: string;
  audience?: string | string[];
  issuer?: string;
}

/**
 * Generate a JWT token with the provided payload and options
 */
export function generateToken(
  payload: TokenPayload,
  secret: string,
  options: TokenOptions
): string {
  if (!secret) {
    throw new Error('JWT secret is required');
  }

  return jwt.sign(payload, secret, options);
}

/**
 * Verify a JWT token and return the decoded payload
 */
export function verifyToken<T = any>(token: string, secret: string): T {
  if (!token) {
    throw new Error('Token is required');
  }

  if (!secret) {
    throw new Error('JWT secret is required');
  }

  return jwt.verify(token, secret) as T;
}

/**
 * Generate a token for email verification
 */
export function generateEmailVerificationToken(userId: string, secret: string): string {
  return generateToken({ userId }, secret, { expiresIn: '24h' });
}

/**
 * Generate a token for password reset
 */
export function generatePasswordResetToken(userId: string, secret: string): string {
  return generateToken({ userId }, secret, { expiresIn: '1h' });
}
