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
    companies: string[];
    password: string;
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
    confidence?: number;
    status: TransactionStatus;
    approvedBy?: string;
    approvedAt?: Date;
    notes?: string;
    location?: Location;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    tellerTransactionId?: string;
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
    storageKey: string;
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
    uploadedBy: string;
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
export declare const isUser: (obj: any) => obj is User;
export declare const isTransaction: (obj: any) => obj is Transaction;
export declare const isReceipt: (obj: any) => obj is Receipt;
//# sourceMappingURL=models.d.ts.map