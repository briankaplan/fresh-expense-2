export enum TransactionStatus {
  PENDING = "pending",
  POSTED = "posted",
  CANCELLED = "cancelled",
  FAILED = "failed",
  CLEARED = "cleared",
  DECLINED = "declined",
}

export enum TransactionType {
  EXPENSE = "expense",
  INCOME = "income",
  TRANSFER = "transfer",
  REFUND = "refund",
  FEE = "fee",
  INTEREST = "interest",
  ADJUSTMENT = "adjustment",
  OTHER = "other"
}

export enum TransactionSource {
  TELLER = "teller",
  MANUAL = "manual",
  IMPORT = "import"
}

export const TRANSACTION_CATEGORIES = [
  "income",
  "salary",
  "investment",
  "transfer",
  "food",
  "groceries",
  "dining",
  "transportation",
  "housing",
  "utilities",
  "insurance",
  "healthcare",
  "education",
  "shopping",
  "entertainment",
  "travel",
  "personal",
  "family",
  "gifts",
  "charity",
  "business",
  "taxes",
  "fees",
  "other",
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export const TRANSACTION_SEARCH_DEFAULTS = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_SORT: "-date",
  ALLOWED_SORT_FIELDS: [
    "date",
    "amount.value",
    "description",
    "merchant.name",
    "category",
  ] as const,
} as const;

export const TRANSACTION_VALIDATION = {
  DESCRIPTION: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 255,
  },
  AMOUNT: {
    MIN: -1000000, // -1M
    MAX: 1000000, // 1M
  },
  NOTES: {
    MAX_LENGTH: 1000,
  },
  TAGS: {
    MAX_COUNT: 10,
    MAX_LENGTH: 50,
  },
} as const;

export const TRANSACTION_SYNC = {
  BATCH_SIZE: 100,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
} as const;

export const TRANSACTION_EXPORT = {
  FORMATS: ["csv", "json", "pdf"] as const,
  CSV_FIELDS: [
    "date",
    "description",
    "amount.value",
    "amount.currency",
    "category",
    "merchant.name",
    "status",
    "type",
  ] as const,
} as const;

export const TRANSACTION_AGGREGATION = {
  TIME_PERIODS: ["day", "week", "month", "year"] as const,
  METRICS: ["count", "sum", "average"] as const,
} as const;

export const TRANSACTION_AI = {
  CONFIDENCE_THRESHOLD: 0.8,
  MAX_SUGGESTIONS: 3,
  CATEGORIES: {
    MIN_CONFIDENCE: 0.6,
    MAX_SUGGESTIONS: 2,
  },
  TAGS: {
    MIN_CONFIDENCE: 0.7,
    MAX_SUGGESTIONS: 5,
  },
} as const;
