/**
 * Predefined transaction categories
 */
export const TRANSACTION_CATEGORIES = {
  FOOD_AND_DINING: 'Food & Dining',
  GROCERIES: 'Groceries',
  SHOPPING: 'Shopping',
  ENTERTAINMENT: 'Entertainment',
  TRAVEL: 'Travel',
  TRANSPORTATION: 'Transportation',
  UTILITIES: 'Utilities',
  HOUSING: 'Housing',
  HEALTHCARE: 'Healthcare',
  INSURANCE: 'Insurance',
  PERSONAL_CARE: 'Personal Care',
  EDUCATION: 'Education',
  GIFTS_AND_DONATIONS: 'Gifts & Donations',
  BUSINESS_SERVICES: 'Business Services',
  TAXES: 'Taxes',
  INVESTMENTS: 'Investments',
  INCOME: 'Income',
  TRANSFER: 'Transfer',
  FEES_AND_CHARGES: 'Fees & Charges',
  OTHER: 'Other',
} as const;

export type TransactionCategory = keyof typeof TRANSACTION_CATEGORIES;

/**
 * Transaction processing status
 */
export type TransactionStatus = 'pending' | 'processed' | 'failed' | 'rejected';

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
 * AI processed data
 */
export interface AIProcessedData {
  category: CategoryResult;
  description?: string;
  merchant?: string;
  isRecurring?: boolean;
  processedAt: Date;
}

export interface TransactionDto {
  id: string;
  date: Date;
  description: string;
  amount: number;
  category: TransactionCategory;
  merchantId?: string;
  merchantName?: string;
  isRecurring?: boolean;
  notes?: string;
  tags?: string[];
  attachments?: string[];
  status: 'pending' | 'completed' | 'cancelled';
  type: 'debit' | 'credit';
  accountId: string;
  enrichmentData?: {
    aiProcessed?: boolean;
    confidence?: number;
    suggestedCategory?: TransactionCategory;
    originalCategory?: TransactionCategory;
  };
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
} 