/**
 * Core application data models
 */

/**
 * User model representing application users
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'accountant';
  companies: string[]; // IDs of companies user has access to
  password: string; // Hashed password
  refreshToken?: string;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  settings?: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'user' | 'accountant';

export interface UserSettings {
  defaultCompany?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email: boolean;
    push: boolean;
  };
}

/**
 * Company model representing business entities
 */
export interface Company {
  id: string;
  name: string;
  logo?: string;
  defaultCategories: string[];
  users: string[]; // User IDs who have access
  settings: CompanySettings;
  billingInfo?: BillingInfo;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
}

export interface CompanySettings {
  fiscalYearStart: number; // Month (1-12)
  currency: string;
  expenseCategories: ExpenseCategory[];
  approvalWorkflow: boolean;
  requireReceipts: boolean;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  budget?: number;
}

export interface BillingInfo {
  plan: 'free' | 'basic' | 'premium';
  subscriptionId?: string;
  expiresAt?: Date;
}

/**
 * Transaction model representing financial transactions
 */
export interface Transaction {
  id: string;
  date: Date;
  merchant: string;
  amount: number;
  description: string;
  category: string;
  tags: string[];
  companyId: string;
  receiptId?: string;
  isReconciled: boolean;
  isAICategorized: boolean;
  confidence?: number; // AI categorization confidence score
  status: TransactionStatus;
  approvedBy?: string; // User ID
  approvedAt?: Date;
  notes?: string;
  location?: Location;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
  tellerTransactionId?: string; // Reference to external transaction
}

export type TransactionStatus = 'pending' | 'approved' | 'rejected';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

/**
 * Receipt model representing uploaded receipt documents
 */
export interface Receipt {
  id: string;
  filename: string;
  storageKey: string; // R2 location
  mimeType: string;
  size: number;
  uploadDate: Date;
  transactionId?: string;
  extractedData?: {
    merchant?: string;
    date?: Date;
    total?: number;
    items?: ReceiptItem[];
  };
  ocrProcessed: boolean;
  uploadedBy: string; // User ID
}

export interface ReceiptMetadata {
  mimeType: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface OCRData {
  text: string;
  confidence: number;
  processedAt: Date;
  extractedData?: {
    merchant?: string;
    date?: Date;
    total?: number;
    items?: ReceiptItem[];
  };
}

/**
 * ReceiptItem model representing individual items in a receipt
 */
export interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sku?: string;
  category?: string;
  taxAmount?: number;
  discountAmount?: number;
}

/**
 * Subscription model representing recurring payments
 */
export interface Subscription {
  id: string;
  name: string;
  merchant: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annually' | 'custom';
  customFrequencyDays?: number;
  startDate: Date;
  nextPaymentDate: Date;
  category: string;
  companyId: string;
  active: boolean;
  autoDetected: boolean;
  lastPaymentDate?: Date;
  lastPaymentAmount?: number;
  notifyBefore: number; // Days before to notify
  relatedTransactions: string[]; // Transaction IDs
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
}

export type SubscriptionFrequency = 'monthly' | 'quarterly' | 'annually' | 'custom';

/**
 * Report model representing expense reports
 */
export interface Report {
  id: string;
  name: string;
  type: 'expense' | 'category' | 'merchant' | 'custom';
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: {
    companies?: string[];
    categories?: string[];
    merchants?: string[];
    minAmount?: number;
    maxAmount?: number;
    tags?: string[];
  };
  schedule?: ReportSchedule;
  createdAt: Date;
  createdBy: string; // User ID
  lastGeneratedAt?: Date;
  exportFormat?: 'pdf' | 'csv' | 'xlsx';
  savedLocation?: string; // URL or file path
}

export type ReportType = 'expense' | 'category' | 'merchant' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ReportFilters {
  companies?: string[];
  categories?: string[];
  merchants?: string[];
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  excludeCategories?: string[];
  onlyReconciled?: boolean;
  includeReceipts?: boolean;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[]; // Email addresses
  lastSent?: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Type guard functions for runtime type checking
export const isUser = (obj: any): obj is User => {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.firstName === 'string' &&
    typeof obj.lastName === 'string' &&
    ['admin', 'user', 'accountant'].includes(obj.role) &&
    Array.isArray(obj.companies)
  );
};

export const isTransaction = (obj: any): obj is Transaction => {
  return (
    obj &&
    typeof obj.id === 'string' &&
    obj.date instanceof Date &&
    typeof obj.merchant === 'string' &&
    typeof obj.amount === 'number' &&
    typeof obj.description === 'string' &&
    typeof obj.category === 'string' &&
    Array.isArray(obj.tags)
  );
};

export const isReceipt = (obj: any): obj is Receipt => {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.filename === 'string' &&
    typeof obj.storageKey === 'string' &&
    typeof obj.mimeType === 'string' &&
    typeof obj.size === 'number' &&
    obj.uploadDate instanceof Date
  );
};
