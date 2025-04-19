import type { Transaction } from "@fresh-expense/types";

/**
 * Custom error types for transaction processing
 */
export class TransactionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransactionValidationError";
  }
}

export class TransactionMappingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransactionMappingError";
  }
}

/**
 * Raw transaction data from Teller API
 */
export interface TellerTransaction {
  id: string;
  account_id: string;
  date: string;
  description: string;
  details: {
    category: string;
    counterparty?: {
      name: string;
      type: string;
    };
    processing_status: string;
  };
  running_balance: string;
  status: string;
  type: string;
  amount: string;
  links: {
    self: string;
    account: string;
  };
}

/**
 * Intermediate state during AI processing
 */
export interface AIProcessedData {
  category: CategoryResult;
  description?: string;
  merchant?: string;
  isRecurring?: boolean;
  processedAt: Date;
}

/**
 * Predefined transaction categories
 */
export const TRANSACTION_CATEGORIES = {
  SOFTWARE_SUBSCRIPTIONS: "Software Subscriptions",
  TRAVEL_RIDESHARE: "Travel Costs - Cab/Uber/Bus Fare",
  TRAVEL_HOTELS: "Travel Costs - Hotel",
  TRAVEL_CAR: "Travel Costs - Gas/Rental Car",
  TRAVEL_AIRFARE: "Travel Costs - Airfare",
  CLIENT_MEALS: "DH: BD: Client Business Meals",
  COMPANY_MEALS: "Company Meetings and Meals",
  PERSONAL_MEALS: "Meals (Non-Business Related)",
  OFFICE_SUPPLIES: "Office Supplies",
  ADVERTISING: "BD: Advertising & Promotion",
  HARDWARE: "Hardware & Equipment",
  CONFERENCE: "Conference & Training Expenses",
  UNCATEGORIZED: "Uncategorized",
} as const;

/**
 * Category result from categorization
 */
export interface CategoryResult {
  name: keyof typeof TRANSACTION_CATEGORIES;
  confidence: number;
  source: string;
  details?: Record<string, any>;
}

/**
 * Category definitions with keywords and patterns
 */
export const CATEGORY_DEFINITIONS: Array<{
  name: keyof typeof TRANSACTION_CATEGORIES;
  description: string;
  keywords: string[];
  patterns?: RegExp[];
}> = [
  {
    name: "SOFTWARE_SUBSCRIPTIONS",
    description: "Monthly or annual software services",
    keywords: [
      "subscription",
      "software",
      "monthly",
      "annual",
      "recurring",
      "service",
      "adobe",
      "microsoft",
      "google",
      "spotify",
      "netflix",
      "github",
      "slack",
      "zoom",
      "dropbox",
      "apple.com/bill",
      "aws",
      "azure",
    ],
    patterns: [/(?:monthly|annual|subscription|recurring)/i],
  },
  {
    name: "TRAVEL_RIDESHARE",
    description: "Rideshare, taxi, and public transportation",
    keywords: ["uber", "lyft", "taxi", "cab", "bus", "transit", "train", "fare"],
    patterns: [/(?:ride|trip|fare|transit)/i],
  },
  {
    name: "TRAVEL_HOTELS",
    description: "Hotel and lodging expenses",
    keywords: [
      "hotel",
      "lodging",
      "stay",
      "accommodation",
      "airbnb",
      "motel",
      "inn",
      "marriott",
      "hilton",
      "hyatt",
    ],
    patterns: [/(?:night|stay|room|lodging)/i],
  },
  {
    name: "TRAVEL_CAR",
    description: "Gas, rental cars, and vehicle-related expenses",
    keywords: ["gas", "fuel", "rental", "car", "vehicle", "hertz", "avis", "enterprise"],
    patterns: [/(?:rental|gas|fuel|mile)/i],
  },
  {
    name: "TRAVEL_AIRFARE",
    description: "Flight tickets and airline fees",
    keywords: [
      "flight",
      "airline",
      "ticket",
      "airfare",
      "delta",
      "united",
      "american",
      "southwest",
      "air",
    ],
    patterns: [/(?:flight|airline|airfare|ticket)/i],
  },
  {
    name: "CLIENT_MEALS",
    description: "Client-facing business meals",
    keywords: ["client", "business", "meeting", "dinner", "lunch", "restaurant"],
    patterns: [/(?:client|prospect|customer|meeting)/i],
  },
  {
    name: "COMPANY_MEALS",
    description: "Internal team meals and meetings",
    keywords: ["team", "meeting", "lunch", "dinner", "company", "staff", "internal"],
    patterns: [/(?:team|staff|company|meeting)/i],
  },
  {
    name: "PERSONAL_MEALS",
    description: "Personal meal expenses",
    keywords: [
      "restaurant",
      "cafe",
      "food",
      "meal",
      "dining",
      "lunch",
      "dinner",
      "starbucks",
      "mcdonald",
      "doordash",
      "grubhub",
      "ubereats",
    ],
    patterns: [/(?:food|meal|restaurant|cafe)/i],
  },
  {
    name: "OFFICE_SUPPLIES",
    description: "Office materials and supplies",
    keywords: [
      "office depot",
      "staples",
      "supplies",
      "paper",
      "stationery",
      "ink",
      "toner",
      "printer",
      "officemax",
    ],
    patterns: [/(?:office|supply|supplies|paper|ink)/i],
  },
  {
    name: "ADVERTISING",
    description: "Advertising and promotional expenses",
    keywords: [
      "facebook ads",
      "google ads",
      "advertising",
      "promotion",
      "marketing",
      "ad spend",
      "campaign",
    ],
    patterns: [/(?:ad\s|ads\s|advert|promo|campaign)/i],
  },
  {
    name: "HARDWARE",
    description: "Computer hardware and equipment",
    keywords: [
      "computer",
      "laptop",
      "monitor",
      "keyboard",
      "mouse",
      "server",
      "hardware",
      "equipment",
      "device",
    ],
    patterns: [/(?:hardware|equipment|device)/i],
  },
  {
    name: "CONFERENCE",
    description: "Conference and training expenses",
    keywords: [
      "conference",
      "training",
      "workshop",
      "seminar",
      "course",
      "certification",
      "ticket",
      "event",
    ],
    patterns: [/(?:conference|training|workshop|seminar)/i],
  },
];

/**
 * Transaction processing status
 */
export type TransactionStatus = "pending" | "processed" | "failed" | "rejected";

/**
 * Receipt patterns for text extraction
 */
export const RECEIPT_PATTERNS = {
  itemLine: /^([^$\n]+?)\s+[\$\£\€]?\s*(\d+(?:\.\d{2})?)/im,
  withQuantity: /(\d+)\s*(?:x|\*)\s*([^$\n]+?)\s+[\$\£\€]?\s*(\d+(?:\.\d{2})?)/im,
  subtotal: /(?:sub[-\s]?total|amount before tax)(?:[^$\n]*?):?\s*[\$\£\€]?\s*(\d+(?:\.\d{2})?)/i,
  total: /(?:total|amount|sum|balance|charged)(?:[^$\n]*?):?\s*[\$\£\€]?\s*(\d+(?:\.\d{2})?)/i,
  salesTax: /(?:sales[-\s]?tax)(?:[^$\n]*?):?\s*[\$\£\€]?\s*(\d+(?:\.\d{2})?)/i,
  tip: /(?:tip|gratuity)(?:[^$\n]*?):?\s*[\$\£\€]?\s*(\d+(?:\.\d{2})?)/i,
  subscriptionPeriod: /(?:billing period|subscription period)(?:[^:]*?):?\s*([^:\n]+)/i,
  nextBilling: /(?:next billing|renews on)(?:[^:]*?):?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
};

/**
 * Validation rules for transactions
 */
export const transactionValidationRules = {
  amount: {
    min: 0.01,
    max: 1000000,
  },
  date: {
    minDate: new Date("2020-01-01"),
    maxDate: new Date(),
  },
  description: {
    minLength: 1,
    maxLength: 255,
  },
};

/**
 * Validates a transaction amount
 */
export const validateTransactionAmount = (amount: number): boolean => {
  return (
    amount >= transactionValidationRules.amount.min &&
    amount <= transactionValidationRules.amount.max
  );
};

/**
 * Validates a transaction date
 */
export const validateTransactionDate = (date: Date): boolean => {
  return (
    date >= transactionValidationRules.date.minDate &&
    date <= transactionValidationRules.date.maxDate
  );
};

/**
 * Maps a Teller transaction to our Transaction model
 */
export const mapTellerToTransaction = (
  tellerTx: TellerTransaction,
  companyId: string,
  userId: string,
  aiData?: AIProcessedData,
): Partial<Transaction> => {
  return {
    tellerTransactionId: tellerTx.id,
    date: new Date(tellerTx.date),
    amount: Math.abs(Number.parseFloat(tellerTx.amount)), // Teller amounts are signed
    merchant: aiData?.merchant || tellerTx.details?.counterparty?.name || tellerTx.description,
    description: aiData?.description || tellerTx.description,
    category:
      aiData?.category.name || tellerTx.details?.category || TRANSACTION_CATEGORIES.UNCATEGORIZED,
    isAICategorized: !!aiData?.category,
    companyId,
    createdBy: userId,
    status: "pending",
    tags: [],
    isReconciled: false,
  };
};

/**
 * Updates a transaction with AI-processed data
 */
export const updateTransactionWithAI = (
  transaction: Transaction,
  aiData: AIProcessedData,
): Transaction => {
  return {
    ...transaction,
    category: aiData.category.name,
    confidence: aiData.category.confidence,
    description: aiData.description || transaction.description,
    merchant: aiData.merchant || transaction.merchant,
    isAICategorized: true,
    updatedAt: new Date(),
  };
};

/**
 * Validates if a transaction can be linked to a receipt
 */
export const canLinkReceipt = (transaction: Transaction): boolean => {
  return !transaction.receiptId && transaction.amount > 0 && transaction.status !== "rejected";
};

/**
 * Links a receipt to a transaction
 */
export const linkReceiptToTransaction = (
  transaction: Transaction,
  receiptId: string,
): Transaction => {
  return {
    ...transaction,
    receiptId,
    updatedAt: new Date(),
  };
};

/**
 * Type guard for Teller transactions
 */
export const isTellerTransaction = (obj: any): obj is TellerTransaction => {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.account_id === "string" &&
    typeof obj.date === "string" &&
    typeof obj.description === "string" &&
    typeof obj.amount === "string" &&
    obj.details &&
    typeof obj.status === "string"
  );
};

/**
 * Add confidence to Transaction interface extension
 */
export interface TransactionWithAI extends Transaction {
  confidence?: number;
}

/**
 * Enhanced mapping function with validation and categorization
 */
export const mapAndValidateTellerTransaction = (
  tellerTx: TellerTransaction,
  companyId: string,
  userId: string,
  aiData?: AIProcessedData,
): Partial<Transaction> => {
  try {
    const amount = Math.abs(Number.parseFloat(tellerTx.amount));
    const date = new Date(tellerTx.date);

    // Validate amount
    if (!validateTransactionAmount(amount)) {
      throw new TransactionValidationError(`Invalid amount: ${amount}`);
    }

    // Validate date
    if (!validateTransactionDate(date)) {
      throw new TransactionValidationError(`Invalid date: ${date}`);
    }

    // Validate description length
    if (tellerTx.description.length > transactionValidationRules.description.maxLength) {
      throw new TransactionValidationError("Description too long");
    }

    return {
      tellerTransactionId: tellerTx.id,
      date,
      amount,
      merchant: aiData?.merchant || tellerTx.details?.counterparty?.name || tellerTx.description,
      description: aiData?.description || tellerTx.description,
      category:
        aiData?.category.name || tellerTx.details?.category || TRANSACTION_CATEGORIES.UNCATEGORIZED,
      isAICategorized: !!aiData?.category,
      confidence: aiData?.category.confidence || 0.5,
      companyId,
      createdBy: userId,
      status: "pending",
      tags: [],
      isReconciled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (err) {
    const error = err as Error;
    if (error instanceof TransactionValidationError) {
      throw error;
    }
    throw new TransactionMappingError(`Failed to map transaction: ${error.message}`);
  }
};

/**
 * Utility function to detect duplicate transactions
 */
export const isDuplicateTransaction = (
  transaction: Transaction,
  existingTransactions: Transaction[],
): boolean => {
  return existingTransactions.some(
    (existing) =>
      existing.amount != null &&
      existing.date.getTime() === transaction.date.getTime() &&
      existing.merchant != null &&
      existing.id !== transaction.id,
  );
};

/**
 * Utility function to format transaction amount for display
 */
export const formatTransactionAmount = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Utility function to categorize transaction type
 */
export const categorizeTransactionType = (
  transaction: Transaction,
): "expense" | "income" | "transfer" => {
  if (transaction.category.toLowerCase().includes("transfer")) {
    return "transfer";
  }
  return transaction.amount >= 0 ? "income" : "expense";
};

/**
 * Utility function to get transaction status label
 */
export const getTransactionStatusLabel = (status: TransactionStatus): string => {
  const statusMap: Record<TransactionStatus, string> = {
    pending: "Pending",
    processed: "Processed",
    failed: "Failed",
    rejected: "Rejected",
  };
  return statusMap[status] || status;
};

/**
 * Utility function to check if a transaction needs review
 */
export const needsReview = (transaction: TransactionWithAI): boolean => {
  return (
    transaction.amount > 1000 || // High value transaction
    !transaction.category || // Missing category
    transaction.category != null ||
    isDuplicateTransaction(transaction, []) || // Potential duplicate
    (transaction.isAICategorized &&
      transaction.confidence !== undefined &&
      transaction.confidence < 0.8) // Low confidence AI categorization
  );
};
