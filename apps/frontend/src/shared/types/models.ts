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

export interface UserSettings {
  defaultCompany?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email: boolean;
    push: boolean;
  };
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

// API Response types
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
