// User related types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  googleId?: string;
  isVerified: boolean;
  isActive: boolean;
  role: 'admin' | 'user';
  lastLoginAt?: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
  };
}

// Company related types
export interface Company {
  id: string;
  userId: string;
  name: string;
  description?: string;
  industry?: string;
  location?: CompanyLocation;
  contact?: CompanyContact;
  settings: CompanySettings;
  status: 'active' | 'inactive' | 'archived';
  integrations: CompanyIntegrations;
}

export interface CompanyLocation {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates?: [number, number];
}

export interface CompanyContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface CompanySettings {
  currency: string;
  timezone: string;
  dateFormat: string;
  fiscalYearStart?: Date;
  fiscalYearEnd?: Date;
}

export interface CompanyIntegrations {
  teller?: {
    enabled: boolean;
    lastSync?: Date;
    syncStatus?: string;
  };
  email?: {
    enabled: boolean;
    lastSync?: Date;
    syncStatus?: string;
  };
  storage?: {
    enabled: boolean;
    lastSync?: Date;
    syncStatus?: string;
  };
}

// Transaction related types
export interface Transaction {
  id: string;
  accountId: string;
  date: Date;
  description: string;
  amount: number;
  type: 'debit' | 'credit' | 'transfer';
  status: 'pending' | 'posted' | 'cancelled';
  category: string[];
  processingStatus: 'processed' | 'pending' | 'failed';
  runningBalance?: number;
  source: string;
  lastUpdated: Date;
  matchedReceiptId?: string;
  metadata?: Record<string, any>;
  merchantName?: string;
  merchantCategory?: string;
  location?: string;
  isRecurring: boolean;
  clearedDate?: Date;
  notes?: string;
}

// Receipt related types
export interface Receipt {
  id: string;
  expenseId: string;
  userId: string;
  urls: {
    original: string;
    converted?: string;
    thumbnail?: string;
  };
  source: 'CSV' | 'EMAIL' | 'GOOGLE_PHOTOS' | 'MANUAL' | 'UPLOAD';
  merchant: string;
  amount: number;
  date: Date;
  category: string;
  description?: string;
  ocrData?: {
    text: string;
    confidence: number;
    metadata: any;
    processedAt: Date;
  };
}

// Bank Account related types
export interface BankAccount {
  id: string;
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'loan' | 'other';
  subtype?: string;
  institution: {
    name: string;
    id: string;
    logo?: string;
  };
  lastFour: string;
  status: 'active' | 'inactive' | 'error';
  balance: {
    current: number;
    available: number;
    lastUpdated: Date;
  };
  tellerData?: {
    accountId: string;
    enrollmentId?: string;
    status?: string;
    lastSynced?: Date;
  };
}

// Analytics related types
export interface Analytics {
  id: string;
  userId: string;
  companyId: string;
  startDate: Date;
  endDate: Date;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  summary: {
    totalSpent: number;
    averageTransaction: number;
    largestTransaction: number;
    smallestTransaction: number;
    transactionCount: number;
  };
  spendingByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
    count: number;
  }>;
  topMerchants?: Array<{
    merchant: string;
    amount: number;
    count: number;
  }>;
}

// Common types
export type AggregationType = 'sum' | 'average' | 'count' | 'min' | 'max';
export type GroupByPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface AggregationConfig {
  type: AggregationType;
  field: string;
  groupBy?: string | string[];
  period?: GroupByPeriod;
  filters?: Record<string, any>;
}

export interface NormalizedReceipt {
  id: string;
  merchantInfo: {
    name: string;
    normalizedName: string;
    category: string;
    taxId?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
  };
  transaction: {
    date: string;
    total: number;
    subtotal?: number;
    tax?: number;
    tip?: number;
    currency: string;
    paymentMethod?: string;
  };
  items: Array<{
    description: string;
    normalizedDescription: string;
    category: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discounts?: number;
    taxRate?: number;
  }>;
  metadata: {
    receiptFormat: string;
    vendor: string;
    confidence: number;
    processingDate: string;
    originalText?: string;
  };
}

export interface AnalyticsData {
  totalSpent: number;
  averagePerTransaction: number;
  topCategories: Array<{
    category: string;
    amount: number;
  }>;
  spendingTrend: 'increasing' | 'decreasing' | 'stable';
  date: string;
}

export interface ExportOptions {
  validate?: boolean;
  sanitize?: boolean;
  delimiter?: ',' | ';' | '\t';
  paperSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
}

export interface OCROptions {
  enhancedAnalysis?: boolean;
  detectCurrency?: boolean;
  extractLocation?: boolean;
}

export interface BatchProcessingOptions {
  batchSize?: number;
  continueOnError?: boolean;
  processingOptions?: OCROptions;
}

export interface BatchProgress {
  total: number;
  processed: number;
  failed: number;
}

// Hook return types
export interface UseReceiptUploadReturn {
  uploadReceipt: (file: File) => Promise<{ url: string }>;
  uploading: boolean;
  progress: number;
  error: Error | null;
}

export interface UseReceiptOCRReturn {
  processReceipt: (url: string, options?: OCROptions) => Promise<any>;
  processBatch: (urls: string[], options?: BatchProcessingOptions) => Promise<any[]>;
  processing: boolean;
  ocrData: any | null;
  error: Error | null;
  batchProgress: BatchProgress;
}

export interface UseReceiptNormalizationReturn {
  normalizeReceipt: (
    receipt: any,
    options?: {
      merchantNameMapping?: Record<string, string>;
      itemCategoryMapping?: Record<string, string>;
      customNormalizers?: Record<string, (value: any) => any>;
    }
  ) => Promise<NormalizedReceipt>;
  batchNormalizeReceipts: (
    receipts: any[],
    options?: {
      merchantNameMapping?: Record<string, string>;
      itemCategoryMapping?: Record<string, string>;
      customNormalizers?: Record<string, (value: any) => any>;
      continueOnError?: boolean;
    }
  ) => Promise<
    Array<{
      original: any;
      normalized?: NormalizedReceipt;
      error?: Error;
    }>
  >;
  normalizing: boolean;
  error: Error | null;
}

export interface UseDataExportReturn {
  exportToCSV: (data: any[], filename: string, options?: ExportOptions) => Promise<void>;
  exportToPDF: (
    data: any,
    filename: string,
    template: string,
    options?: ExportOptions
  ) => Promise<void>;
  aggregateData: (data: any[], config: AggregationConfig | AggregationConfig[]) => any[];
  exporting: boolean;
  error: Error | null;
  validateData: (data: any[]) => { valid: boolean; errors: string[] };
  sanitizeData: (data: any[]) => any[];
}

export interface UseSpendingAnalyticsReturn {
  data: AnalyticsData | null;
  loading: boolean;
  error: Error | null;
}
