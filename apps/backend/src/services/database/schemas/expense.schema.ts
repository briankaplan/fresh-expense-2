import { BaseSchema } from './base.schema';

export interface ExpenseSchema extends BaseSchema {
  userId: string;
  companyId: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  tags?: string[];
  // Transaction reference
  transactionId?: string;
  // Status and approval
  status: 'pending' | 'approved' | 'rejected' | 'reported' | 'reimbursed';
  approvedBy?: string;
  approvedAt?: Date;
  reportedAt?: Date;
  reimbursedAt?: Date;
  // Payment details
  paymentMethod: 'card' | 'cash' | 'bank_transfer' | 'other';
  currency: string;
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
  // Expense specific
  expenseType?: 'travel' | 'meals' | 'entertainment' | 'office' | 'other';
  expensePolicyId?: string;
  expenseReportId?: string;
  expenseReportStatus?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  // Notes and attachments
  notes?: string;
  attachments?: string[];
  // Metadata
  metadata?: {
    originalTransaction?: string;
    originalDescription?: string;
    originalCategory?: string;
    originalTags?: string[];
    location?: {
      address?: string;
      coordinates?: number[];
    };
    enrichmentSource?: 'teller' | 'ai' | 'manual';
    enrichmentTimestamp?: Date;
    policyViolations?: string[];
    approverNotes?: string[];
  };
}

export interface BudgetSchema extends BaseSchema {
  userId: string;
  name: string;
  amount: number;
  category: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  metadata?: Record<string, any>;
}

export const EXPENSE_COLLECTION = 'expenses';
export const BUDGET_COLLECTION = 'budgets'; 