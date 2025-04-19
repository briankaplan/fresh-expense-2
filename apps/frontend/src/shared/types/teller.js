Object.defineProperty(exports, "__esModule", { value: true });
exports.needsReview =
  exports.getTransactionStatusLabel =
  exports.categorizeTransactionType =
  exports.formatTransactionAmount =
  exports.isDuplicateTransaction =
  exports.mapAndValidateTellerTransaction =
  exports.isTellerTransaction =
  exports.linkReceiptToTransaction =
  exports.canLinkReceipt =
  exports.updateTransactionWithAI =
  exports.mapTellerToTransaction =
  exports.validateTransactionDate =
  exports.validateTransactionAmount =
  exports.transactionValidationRules =
  exports.RECEIPT_PATTERNS =
  exports.CATEGORY_DEFINITIONS =
  exports.TRANSACTION_CATEGORIES =
  exports.TransactionMappingError =
  exports.TransactionValidationError =
    void 0;
/**
 * Custom error types for transaction processing
 */
class TransactionValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "TransactionValidationError";
  }
}
exports.TransactionValidationError = TransactionValidationError;
class TransactionMappingError extends Error {
  constructor(message) {
    super(message);
    this.name = "TransactionMappingError";
  }
}
exports.TransactionMappingError = TransactionMappingError;
/**
 * Predefined transaction categories
 */
exports.TRANSACTION_CATEGORIES = {
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
};
/**
 * Category definitions with keywords and patterns
 */
exports.CATEGORY_DEFINITIONS = [
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
 * Receipt patterns for text extraction
 */
exports.RECEIPT_PATTERNS = {
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
exports.transactionValidationRules = {
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
const validateTransactionAmount = (amount) => {
  return (
    amount >= exports.transactionValidationRules.amount.min &&
    amount <= exports.transactionValidationRules.amount.max
  );
};
exports.validateTransactionAmount = validateTransactionAmount;
/**
 * Validates a transaction date
 */
const validateTransactionDate = (date) => {
  return (
    date >= exports.transactionValidationRules.date.minDate &&
    date <= exports.transactionValidationRules.date.maxDate
  );
};
exports.validateTransactionDate = validateTransactionDate;
/**
 * Maps a Teller transaction to our Transaction model
 */
const mapTellerToTransaction = (tellerTx, companyId, userId, aiData) => {
  return {
    tellerTransactionId: tellerTx.id,
    date: new Date(tellerTx.date),
    amount: Math.abs(Number.parseFloat(tellerTx.amount)), // Teller amounts are signed
    merchant: aiData?.merchant || tellerTx.details?.counterparty?.name || tellerTx.description,
    description: aiData?.description || tellerTx.description,
    category:
      aiData?.category.name ||
      tellerTx.details?.category ||
      exports.TRANSACTION_CATEGORIES.UNCATEGORIZED,
    isAICategorized: !!aiData?.category,
    companyId,
    createdBy: userId,
    status: "pending",
    tags: [],
    isReconciled: false,
  };
};
exports.mapTellerToTransaction = mapTellerToTransaction;
/**
 * Updates a transaction with AI-processed data
 */
const updateTransactionWithAI = (transaction, aiData) => {
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
exports.updateTransactionWithAI = updateTransactionWithAI;
/**
 * Validates if a transaction can be linked to a receipt
 */
const canLinkReceipt = (transaction) => {
  return !transaction.receiptId && transaction.amount > 0 && transaction.status !== "rejected";
};
exports.canLinkReceipt = canLinkReceipt;
/**
 * Links a receipt to a transaction
 */
const linkReceiptToTransaction = (transaction, receiptId) => {
  return {
    ...transaction,
    receiptId,
    updatedAt: new Date(),
  };
};
exports.linkReceiptToTransaction = linkReceiptToTransaction;
/**
 * Type guard for Teller transactions
 */
const isTellerTransaction = (obj) => {
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
exports.isTellerTransaction = isTellerTransaction;
/**
 * Enhanced mapping function with validation and categorization
 */
const mapAndValidateTellerTransaction = (tellerTx, companyId, userId, aiData) => {
  try {
    const amount = Math.abs(Number.parseFloat(tellerTx.amount));
    const date = new Date(tellerTx.date);
    // Validate amount
    if (!(0, exports.validateTransactionAmount)(amount)) {
      throw new TransactionValidationError(`Invalid amount: ${amount}`);
    }
    // Validate date
    if (!(0, exports.validateTransactionDate)(date)) {
      throw new TransactionValidationError(`Invalid date: ${date}`);
    }
    // Validate description length
    if (tellerTx.description.length > exports.transactionValidationRules.description.maxLength) {
      throw new TransactionValidationError("Description too long");
    }
    return {
      tellerTransactionId: tellerTx.id,
      date,
      amount,
      merchant: aiData?.merchant || tellerTx.details?.counterparty?.name || tellerTx.description,
      description: aiData?.description || tellerTx.description,
      category:
        aiData?.category.name ||
        tellerTx.details?.category ||
        exports.TRANSACTION_CATEGORIES.UNCATEGORIZED,
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
    const error = err;
    if (error instanceof TransactionValidationError) {
      throw error;
    }
    throw new TransactionMappingError(`Failed to map transaction: ${error.message}`);
  }
};
exports.mapAndValidateTellerTransaction = mapAndValidateTellerTransaction;
/**
 * Utility function to detect duplicate transactions
 */
const isDuplicateTransaction = (transaction, existingTransactions) => {
  return existingTransactions.some(
    (existing) =>
      existing.amount != null &&
      existing.date.getTime() === transaction.date.getTime() &&
      existing.merchant != null &&
      existing.id !== transaction.id,
  );
};
exports.isDuplicateTransaction = isDuplicateTransaction;
/**
 * Utility function to format transaction amount for display
 */
const formatTransactionAmount = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};
exports.formatTransactionAmount = formatTransactionAmount;
/**
 * Utility function to categorize transaction type
 */
const categorizeTransactionType = (transaction) => {
  if (transaction.category.toLowerCase().includes("transfer")) {
    return "transfer";
  }
  return transaction.amount >= 0 ? "income" : "expense";
};
exports.categorizeTransactionType = categorizeTransactionType;
/**
 * Utility function to get transaction status label
 */
const getTransactionStatusLabel = (status) => {
  const statusMap = {
    pending: "Pending",
    processed: "Processed",
    failed: "Failed",
    rejected: "Rejected",
  };
  return statusMap[status] || status;
};
exports.getTransactionStatusLabel = getTransactionStatusLabel;
/**
 * Utility function to check if a transaction needs review
 */
const needsReview = (transaction) => {
  return (
    transaction.amount > 1000 || // High value transaction
    !transaction.category || // Missing category
    transaction.category != null ||
    (0, exports.isDuplicateTransaction)(transaction, []) || // Potential duplicate
    (transaction.isAICategorized &&
      transaction.confidence !== undefined &&
      transaction.confidence < 0.8) // Low confidence AI categorization
  );
};
exports.needsReview = needsReview;
//# sourceMappingURL=teller.js.map
