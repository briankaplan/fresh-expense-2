// Transaction Categories
export const TRANSACTION_CATEGORIES = {
  FOOD_AND_DINING: "FOOD_AND_DINING",
  GROCERIES: "GROCERIES",
  SHOPPING: "SHOPPING",
  ENTERTAINMENT: "ENTERTAINMENT",
  TRAVEL: "TRAVEL",
  TRANSPORTATION: "TRANSPORTATION",
  UTILITIES: "UTILITIES",
  RENT_MORTGAGE: "RENT_MORTGAGE",
  HEALTHCARE: "HEALTHCARE",
  INSURANCE: "INSURANCE",
  EDUCATION: "EDUCATION",
  PERSONAL_CARE: "PERSONAL_CARE",
  GIFTS_DONATIONS: "GIFTS_DONATIONS",
  BUSINESS: "BUSINESS",
  TAXES: "TAXES",
  INVESTMENTS: "INVESTMENTS",
  UNCATEGORIZED: "UNCATEGORIZED",
} as const;

// Date Formats
export const DATE_FORMATS = {
  DEFAULT: "YYYY-MM-DD",
  US: "MM/DD/YYYY",
  EU: "DD/MM/YYYY",
  FULL: "YYYY-MM-DD HH:mm:ss",
  ISO: "YYYY-MM-DDTHH:mm:ss.SSSZ",
} as const;

// Currency Codes
export const CURRENCY_CODES = {
  USD: "USD",
  EUR: "EUR",
  GBP: "GBP",
  CAD: "CAD",
  AUD: "AUD",
  JPY: "JPY",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    GOOGLE: "/api/auth/google",
    VERIFY_EMAIL: "/api/auth/verify-email",
  },
  TRANSACTIONS: {
    BASE: "/api/transactions",
    SYNC: "/api/transactions/sync",
    CATEGORIZE: "/api/transactions/categorize",
    EXPORT: "/api/transactions/export",
  },
  RECEIPTS: {
    BASE: "/api/receipts",
    UPLOAD: "/api/receipts/upload",
    OCR: "/api/receipts/ocr",
  },
  ANALYTICS: {
    BASE: "/api/analytics",
    SPENDING: "/api/analytics/spending",
    TRENDS: "/api/analytics/trends",
  },
} as const;

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  EXTERNAL_API_ERROR: "EXTERNAL_API_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
    SPECIAL_CHARS: "!@#$%^&*",
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    ALLOWED_CHARS: "^[a-zA-Z0-9_-]+$",
  },
  TRANSACTION: {
    MIN_AMOUNT: 0.01,
    MAX_AMOUNT: 1000000,
  },
} as const;

// File Upload Limits
export const UPLOAD_LIMITS = {
  RECEIPT_IMAGE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/heic", "application/pdf"],
    MAX_WIDTH: 4096,
    MAX_HEIGHT: 4096,
  },
} as const;

// Cache Keys
export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user:${userId}:profile`,
  TRANSACTION_LIST: (userId: string) => `user:${userId}:transactions`,
  ANALYTICS_SUMMARY: (userId: string) => `user:${userId}:analytics:summary`,
  COMPANY_SETTINGS: (companyId: string) => `company:${companyId}:settings`,
} as const;
