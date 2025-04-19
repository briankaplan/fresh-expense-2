// Pagination constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MIN_PAGE = 1;

// Date format constants
export const DATE_FORMAT = "YYYY-MM-DD";
export const DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
export const TIME_FORMAT = "HH:mm:ss";

// File size constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

// API constants
export const API_VERSION = "v1";
export const DEFAULT_API_TIMEOUT = 30000; // 30 seconds

// Cache constants
export const DEFAULT_CACHE_TTL = 3600; // 1 hour
export const MAX_CACHE_TTL = 86400; // 24 hours

// Error constants
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Forbidden access",
  NOT_FOUND: "Resource not found",
  VALIDATION_ERROR: "Validation error",
  INTERNAL_ERROR: "Internal server error",
} as const;
