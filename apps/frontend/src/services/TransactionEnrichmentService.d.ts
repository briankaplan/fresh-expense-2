import { Transaction } from '@fresh-expense/types';
declare class TransactionEnrichmentService {
    private static instance;
    private apiBaseUrl;
    private merchantCache;
    private lastCategories;
    private constructor();
    static getInstance(): TransactionEnrichmentService;
    /**
     * Calculate match score for categorization
     */
    private calculateMatchScore;
    /**
     * Categorize a transaction using local rules first
     */
    private categorizeTransaction;
    /**
     * Categorize based on transaction amount
     */
    private categorizeByAmount;
    /**
     * Check historical categorization data
     */
    private checkHistoricalData;
    /**
     * Update historical categorization data
     */
    private updateHistoricalData;
    /**
     * Process a transaction with AI for categorization and enrichment
     */
    processWithAI(transaction: Transaction): Promise<Transaction>;
    /**
     * Process a batch of transactions with AI
     */
    processBatchWithAI(transactions: Transaction[]): Promise<Transaction[]>;
    /**
     * Link a receipt to a transaction and extract data
     */
    processReceiptForTransaction(transaction: Transaction, receiptId: string): Promise<Transaction>;
    /**
     * Reprocess a transaction with updated AI models
     */
    reprocessTransaction(transaction: Transaction): Promise<Transaction>;
    private categorizeByMerchant;
}
export default TransactionEnrichmentService;
//# sourceMappingURL=TransactionEnrichmentService.d.ts.map