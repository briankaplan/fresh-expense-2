export type TransactionType = 'debit' | 'credit' | 'receipt';
export type TransactionStatus = 'pending' | 'posted' | 'canceled' | 'error' | 'processing' | 'unmatched' | 'matched';

export interface BaseTransactionData {
    id?: string;
    accountId?: string;
    description?: string;
    type?: TransactionType;
    status?: TransactionStatus;
    merchantName: string;
    amount: number;
    date: Date;
}

export interface MatchScoreDetails {
    merchantScore: number;
    amountScore: number;
    dateScore: number;
    totalScore: number;
}

export interface ReceiptMatchingOptions {
    minConfidence?: number;
    maxDateDifference?: number;
    maxAmountDifference?: number;
    merchantMatchThreshold?: number;
}

export interface ReceiptMatchScore {
    score: number;
    details: MatchScoreDetails;
} 