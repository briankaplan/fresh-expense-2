"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_KEYS = exports.UPLOAD_LIMITS = exports.VALIDATION_RULES = exports.ERROR_CODES = exports.API_ENDPOINTS = exports.CURRENCY_CODES = exports.DATE_FORMATS = exports.TRANSACTION_CATEGORIES = void 0;
// Transaction Categories
exports.TRANSACTION_CATEGORIES = {
    FOOD_AND_DINING: 'FOOD_AND_DINING',
    GROCERIES: 'GROCERIES',
    SHOPPING: 'SHOPPING',
    ENTERTAINMENT: 'ENTERTAINMENT',
    TRAVEL: 'TRAVEL',
    TRANSPORTATION: 'TRANSPORTATION',
    UTILITIES: 'UTILITIES',
    RENT_MORTGAGE: 'RENT_MORTGAGE',
    HEALTHCARE: 'HEALTHCARE',
    INSURANCE: 'INSURANCE',
    EDUCATION: 'EDUCATION',
    PERSONAL_CARE: 'PERSONAL_CARE',
    GIFTS_DONATIONS: 'GIFTS_DONATIONS',
    BUSINESS: 'BUSINESS',
    TAXES: 'TAXES',
    INVESTMENTS: 'INVESTMENTS',
    UNCATEGORIZED: 'UNCATEGORIZED',
};
// Date Formats
exports.DATE_FORMATS = {
    DEFAULT: 'YYYY-MM-DD',
    US: 'MM/DD/YYYY',
    EU: 'DD/MM/YYYY',
    FULL: 'YYYY-MM-DD HH:mm:ss',
    ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
};
// Currency Codes
exports.CURRENCY_CODES = {
    USD: 'USD',
    EUR: 'EUR',
    GBP: 'GBP',
    CAD: 'CAD',
    AUD: 'AUD',
    JPY: 'JPY',
};
// API Endpoints
exports.API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout',
        REFRESH: '/api/auth/refresh',
        GOOGLE: '/api/auth/google',
        VERIFY_EMAIL: '/api/auth/verify-email',
    },
    TRANSACTIONS: {
        BASE: '/api/transactions',
        SYNC: '/api/transactions/sync',
        CATEGORIZE: '/api/transactions/categorize',
        EXPORT: '/api/transactions/export',
    },
    RECEIPTS: {
        BASE: '/api/receipts',
        UPLOAD: '/api/receipts/upload',
        OCR: '/api/receipts/ocr',
    },
    ANALYTICS: {
        BASE: '/api/analytics',
        SPENDING: '/api/analytics/spending',
        TRENDS: '/api/analytics/trends',
    },
};
// Error Codes
exports.ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
    EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};
// Validation Rules
exports.VALIDATION_RULES = {
    PASSWORD: {
        MIN_LENGTH: 8,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBER: true,
        REQUIRE_SPECIAL: true,
        SPECIAL_CHARS: '!@#$%^&*',
    },
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 50,
        ALLOWED_CHARS: '^[a-zA-Z0-9_-]+$',
    },
    TRANSACTION: {
        MIN_AMOUNT: 0.01,
        MAX_AMOUNT: 1000000,
    },
};
// File Upload Limits
exports.UPLOAD_LIMITS = {
    RECEIPT_IMAGE: {
        MAX_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/heic', 'application/pdf'],
        MAX_WIDTH: 4096,
        MAX_HEIGHT: 4096,
    },
};
// Cache Keys
exports.CACHE_KEYS = {
    USER_PROFILE: (userId) => `user:${userId}:profile`,
    TRANSACTION_LIST: (userId) => `user:${userId}:transactions`,
    ANALYTICS_SUMMARY: (userId) => `user:${userId}:analytics:summary`,
    COMPANY_SETTINGS: (companyId) => `company:${companyId}:settings`,
};
//# sourceMappingURL=index.js.map