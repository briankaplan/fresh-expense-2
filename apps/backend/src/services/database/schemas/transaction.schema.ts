import { BaseSchema } from './base.schema';

export interface TransactionSchema extends BaseSchema {
  userId: string;
  accountId: string;
  amount: number;
  description: string;
  date: Date;
  category: string;
  type: 'income' | 'expense';
  status: 'pending' | 'posted' | 'canceled';
  notes?: string;
  tags?: string[];
  // Teller specific fields
  tellerTransactionId: string;
  tellerAccountId: string;
  tellerStatus: string;
  tellerCategory?: string;
  tellerMerchant?: string;
  // Expense reference
  expenseId?: string;
  companyId?: string;
  isExpense: boolean;
  // Merchant information
  merchantId?: string;
  merchantName?: string;
  merchantCategory?: string;
  merchantLocation?: {
    address?: string;
    coordinates?: number[];
  };
  // Subscription tracking
  isSubscription?: boolean;
  subscriptionId?: string;
  subscriptionName?: string;
  subscriptionFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  subscriptionNextDate?: Date;
  subscriptionEndDate?: Date;
  // Receipt handling
  receiptId?: string;
  receiptUrl?: string;
  receiptStatus?: 'pending' | 'matched' | 'unmatched';
  receiptMatchedAt?: Date;
  receiptUnmatchedAt?: Date;
  // Auto-categorization
  aiProcessed?: boolean;
  aiCategory?: string;
  aiConfidence?: number;
  aiDescription?: string;
  aiTags?: string[];
  aiCompany?: string;
  // Enrichment data
  metadata?: {
    originalDescription?: string;
    originalCategory?: string;
    originalTags?: string[];
    location?: {
      address?: string;
      coordinates?: number[];
    };
    enrichmentSource?: 'teller' | 'ai' | 'manual';
    enrichmentTimestamp?: Date;
  };
}

export const TRANSACTION_COLLECTION = 'transactions'; 