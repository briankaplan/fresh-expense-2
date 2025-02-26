import { Password } from '../types';
import { AppError, ErrorCodes } from './error';

export function validatePassword(password: Password): void {
  const errors: string[] = [];

  if (!password.website) errors.push('Website is required');
  if (!password.username) errors.push('Username is required');
  if (!password.password) errors.push('Password is required');

  if (errors.length > 0) {
    throw new AppError(
      'Password validation failed: ' + errors.join(', '),
      ErrorCodes.VALIDATION_ERROR
    );
  }
} 