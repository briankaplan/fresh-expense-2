export declare const TRANSACTION_CATEGORIES: {
    readonly FOOD_AND_DINING: "FOOD_AND_DINING";
    readonly GROCERIES: "GROCERIES";
    readonly SHOPPING: "SHOPPING";
    readonly ENTERTAINMENT: "ENTERTAINMENT";
    readonly TRAVEL: "TRAVEL";
    readonly TRANSPORTATION: "TRANSPORTATION";
    readonly UTILITIES: "UTILITIES";
    readonly RENT_MORTGAGE: "RENT_MORTGAGE";
    readonly HEALTHCARE: "HEALTHCARE";
    readonly INSURANCE: "INSURANCE";
    readonly EDUCATION: "EDUCATION";
    readonly PERSONAL_CARE: "PERSONAL_CARE";
    readonly GIFTS_DONATIONS: "GIFTS_DONATIONS";
    readonly BUSINESS: "BUSINESS";
    readonly TAXES: "TAXES";
    readonly INVESTMENTS: "INVESTMENTS";
    readonly UNCATEGORIZED: "UNCATEGORIZED";
};
export declare const DATE_FORMATS: {
    readonly DEFAULT: "YYYY-MM-DD";
    readonly US: "MM/DD/YYYY";
    readonly EU: "DD/MM/YYYY";
    readonly FULL: "YYYY-MM-DD HH:mm:ss";
    readonly ISO: "YYYY-MM-DDTHH:mm:ss.SSSZ";
};
export declare const CURRENCY_CODES: {
    readonly USD: "USD";
    readonly EUR: "EUR";
    readonly GBP: "GBP";
    readonly CAD: "CAD";
    readonly AUD: "AUD";
    readonly JPY: "JPY";
};
export declare const API_ENDPOINTS: {
    readonly AUTH: {
        readonly LOGIN: "/api/auth/login";
        readonly REGISTER: "/api/auth/register";
        readonly LOGOUT: "/api/auth/logout";
        readonly REFRESH: "/api/auth/refresh";
        readonly GOOGLE: "/api/auth/google";
        readonly VERIFY_EMAIL: "/api/auth/verify-email";
    };
    readonly TRANSACTIONS: {
        readonly BASE: "/api/transactions";
        readonly SYNC: "/api/transactions/sync";
        readonly CATEGORIZE: "/api/transactions/categorize";
        readonly EXPORT: "/api/transactions/export";
    };
    readonly RECEIPTS: {
        readonly BASE: "/api/receipts";
        readonly UPLOAD: "/api/receipts/upload";
        readonly OCR: "/api/receipts/ocr";
    };
    readonly ANALYTICS: {
        readonly BASE: "/api/analytics";
        readonly SPENDING: "/api/analytics/spending";
        readonly TRENDS: "/api/analytics/trends";
    };
};
export declare const ERROR_CODES: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR";
    readonly AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly DUPLICATE_ENTRY: "DUPLICATE_ENTRY";
    readonly EXTERNAL_API_ERROR: "EXTERNAL_API_ERROR";
    readonly DATABASE_ERROR: "DATABASE_ERROR";
    readonly UNKNOWN_ERROR: "UNKNOWN_ERROR";
};
export declare const VALIDATION_RULES: {
    readonly PASSWORD: {
        readonly MIN_LENGTH: 8;
        readonly REQUIRE_UPPERCASE: true;
        readonly REQUIRE_LOWERCASE: true;
        readonly REQUIRE_NUMBER: true;
        readonly REQUIRE_SPECIAL: true;
        readonly SPECIAL_CHARS: "!@#$%^&*";
    };
    readonly USERNAME: {
        readonly MIN_LENGTH: 3;
        readonly MAX_LENGTH: 50;
        readonly ALLOWED_CHARS: "^[a-zA-Z0-9_-]+$";
    };
    readonly TRANSACTION: {
        readonly MIN_AMOUNT: 0.01;
        readonly MAX_AMOUNT: 1000000;
    };
};
export declare const UPLOAD_LIMITS: {
    readonly RECEIPT_IMAGE: {
        readonly MAX_SIZE: number;
        readonly ALLOWED_TYPES: readonly ["image/jpeg", "image/png", "image/heic", "application/pdf"];
        readonly MAX_WIDTH: 4096;
        readonly MAX_HEIGHT: 4096;
    };
};
export declare const CACHE_KEYS: {
    readonly USER_PROFILE: (userId: string) => string;
    readonly TRANSACTION_LIST: (userId: string) => string;
    readonly ANALYTICS_SUMMARY: (userId: string) => string;
    readonly COMPANY_SETTINGS: (companyId: string) => string;
};
//# sourceMappingURL=index.d.ts.map