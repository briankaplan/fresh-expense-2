export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ErrorCodes = {
  HIBP_API_ERROR: 'HIBP_API_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  KEYCHAIN_ERROR: 'KEYCHAIN_ERROR',
  SECURITY_ERROR: 'SECURITY_ERROR',
  BATCH_ERROR: 'BATCH_ERROR'
} as const;

export type ErrorCode = keyof typeof ErrorCodes; 