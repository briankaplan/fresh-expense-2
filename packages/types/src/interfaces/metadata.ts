import { Types } from 'mongoose';

export interface BaseMetadata {
    createdBy?: string;
    updatedBy?: string;
    source?: string;
    [key: string]: unknown;
}

export interface CompanyMetadata extends BaseMetadata {
    lastReportedAt?: Date;
    totalExpenses?: number;
    averageExpense?: number;
    lastCategorizedAt?: Date;
}

export interface ExpenseMetadata extends BaseMetadata {
    project?: string;
    department?: string;
    costCenter?: string;
    approvedBy?: string;
    approvedAt?: Date;
    reviewedBy?: string;
    reviewedAt?: Date;
}

export interface ReceiptMetadata extends BaseMetadata {
    date?: Date;
    total?: number;
    merchant?: string;
    items?: Array<{
        name: string;
        price: number;
        quantity?: number;
    }>;
}

export interface TransactionMetadata extends BaseMetadata {
    date?: Date;
    amount?: number;
    description?: string;
    category?: string;
    merchant?: string;
}

export interface MerchantMetadata extends BaseMetadata {
    taxId?: string;
    industry?: string;
    lastVerifiedAt?: Date;
    verifiedBy?: string;
    preferredPaymentMethod?: string;
    paymentTerms?: string;
    creditLimit?: number;
    riskScore?: number;
}

export interface UserMetadata extends BaseMetadata {
    lastLoginIp?: string;
    lastLoginDevice?: string;
    preferences?: {
        theme?: string;
        language?: string;
        timezone?: string;
        dateFormat?: string;
    };
} 