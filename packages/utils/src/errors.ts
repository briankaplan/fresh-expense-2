/**
 * Base error class for all custom errors in the application
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Error class for validation errors
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Error class for API errors
 */
export class ApiError extends AppError {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Error class for database errors
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

/**
 * Error class for file system errors
 */
export class FileSystemError extends AppError {
  constructor(
    message: string,
    public path?: string,
  ) {
    super(message);
    this.name = "FileSystemError";
  }
}
