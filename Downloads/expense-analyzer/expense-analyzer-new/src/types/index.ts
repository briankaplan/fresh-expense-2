export interface ValidationIssue {
  field: string;
  message: string;
}

export interface BankTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: string;
  category: string;
  status: string;
  hasReceipt?: boolean;
  receiptUrl?: string;
}

export interface Expense {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  description: string;
  type: 'personal' | 'business';
  receiptId?: string;
}

export interface OCRResult {
  merchant: string;
  date: string;
  total: number;
  tax?: number;
  items?: Array<{
    description: string;
    amount: number;
    quantity?: number;
    category?: string;
    taxRate?: number;
  }>;
  confidence: number;
  raw?: {
    text: string;
    boxes?: Array<{
      text: string;
      bbox: [number, number, number, number];
      confidence: number;
    }>;
  };
  metadata?: {
    pageCount?: number;
    imageQuality?: number;
    processingTime?: number;
    source?: string;
    engine?: string;
  };
}

export interface ProcessedReceipt {
  id: string;
  originalSource: {
    type: 'email' | 'sms' | 'dropbox' | 'upload';
    identifier: string;
    metadata?: Record<string, any>;
  };
  backupUrl: string;
  ocrData: OCRResult;
  status: 'pending' | 'matched' | 'unmatched' | 'error';
  processedAt: Date;
  matchedTransaction?: BankTransaction;
  expense?: Expense;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ReceiptMatch {
  receipt: ProcessedReceipt;
  transaction: BankTransaction;
  confidence: number;
  matchReason?: string[];
  metadata?: {
    dateDistance?: number;
    amountDifference?: number;
    merchantSimilarity?: number;
  };
}

export interface ReceiptProcessingOptions {
  validateResults?: boolean;
  requireHighConfidence?: boolean;
  minConfidence?: number;
  extractItems?: boolean;
  detectDuplicates?: boolean;
  saveOriginal?: boolean;
  ocrEngine?: 'mindee' | 'google' | 'azure';
  backupStrategy?: 'dropbox' | 's3' | 'local';
  notifyOnError?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
}

export interface ReconciledItem {
  id: string;
  transactionId: string;
  expenseId: string;
  matchConfidence: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface CashExpenseFormData {
  date: string;
  amount: number;
  merchant: string;
  category: string;
  description: string;
  attendees: string;
  type: 'personal' | 'business';
  receipt?: FileList;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface MatchResult {
  transactionId: string;
  expense: Expense;
  score: number;
  metadata?: {
    matchType: 'exact' | 'fuzzy' | 'manual';
    confidence: number;
    matchedFields: string[];
  };
} 