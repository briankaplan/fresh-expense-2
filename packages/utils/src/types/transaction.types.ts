export type TransactionCategory =
    | 'FOOD_AND_DINING'
    | 'GROCERIES'
    | 'SHOPPING'
    | 'ENTERTAINMENT'
    | 'TRAVEL'
    | 'TRANSPORTATION'
    | 'UTILITIES'
    | 'HOUSING'
    | 'HEALTHCARE'
    | 'INSURANCE'
    | 'PERSONAL_CARE'
    | 'EDUCATION'
    | 'GIFTS_AND_DONATIONS'
    | 'BUSINESS_SERVICES'
    | 'TAXES'
    | 'INVESTMENTS'
    | 'INCOME'
    | 'TRANSFER'
    | 'FEES_AND_CHARGES'
    | 'OTHER';

export interface TransactionAnalysisResult {
    category: TransactionCategory;
    isSubscription: boolean;
    frequency?: string;
    nextPaymentDate?: Date;
    averageAmount?: number;
}

export interface TransactionLocation {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    coordinates?: [number, number];
}

export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface BaseTransactionData {
    id: string;
    accountId: string;
    amount: number;
    date: Date;
    description: string;
    type: 'debit' | 'credit';
    status: 'pending' | 'posted' | 'canceled';
    category?: TransactionCategory;
    merchant?: string;
    merchantName?: string;
    merchantCategory?: TransactionCategory;
    location?: {
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
    };
    runningBalance?: number;
    isRecurring?: boolean;
    notes?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    lastUpdated?: Date;
}

export interface TransactionSummary {
    totalSpent: number;
    averageTransaction: number;
    frequency?: FrequencyType;
    lastPurchase?: Date;
    category?: TransactionCategory;
    transactions: BaseTransactionData[];
}
