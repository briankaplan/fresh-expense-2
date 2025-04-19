"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const teller_1 = require("@/shared/types/teller");
class TransactionEnrichmentService {
    static instance;
    apiBaseUrl;
    merchantCache = new Map();
    lastCategories = new Map();
    constructor() {
        this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    }
    static getInstance() {
        if (!TransactionEnrichmentService.instance) {
            TransactionEnrichmentService.instance = new TransactionEnrichmentService();
        }
        return TransactionEnrichmentService.instance;
    }
    /**
     * Calculate match score for categorization
     */
    calculateMatchScore(text, keywords, patterns = []) {
        if (!keywords.length && !patterns?.length) {
            return 0.5;
        }
        let score = 0;
        let matches = 0;
        const normalizedText = text.toLowerCase();
        // Check keywords
        for (const keyword of keywords) {
            if (normalizedText.includes(keyword.toLowerCase())) {
                score += 0.15;
                matches++;
            }
        }
        // Check patterns
        if (patterns) {
            for (const pattern of patterns) {
                if (pattern.test(normalizedText)) {
                    score += 0.2;
                    matches++;
                }
            }
        }
        return matches > 0 ? Math.min(0.9, score) : 0.5;
    }
    /**
     * Categorize a transaction using local rules first
     */
    categorizeTransaction(transaction) {
        const description = transaction.description?.toLowerCase() || '';
        const merchant = transaction.merchant.toLowerCase();
        const combinedText = `${merchant} ${description}`.toLowerCase();
        let bestMatch = {
            name: 'UNCATEGORIZED',
            confidence: 0.5,
            source: 'default',
            details: { reason: 'Initial categorization' },
        };
        // Check merchant cache first
        const cachedResult = this.merchantCache.get(merchant);
        if (cachedResult) {
            return cachedResult.category;
        }
        // Try each category definition
        for (const category of teller_1.CATEGORY_DEFINITIONS) {
            const score = this.calculateMatchScore(combinedText, category.keywords, category.patterns);
            if (score > bestMatch.confidence) {
                bestMatch = {
                    name: category.name,
                    confidence: score,
                    source: 'pattern_match',
                    details: {
                        matchedText: combinedText.substring(0, 50) + '...',
                    },
                };
            }
        }
        // Check amount-based rules
        if (bestMatch.confidence < 0.7) {
            const amountMatch = this.categorizeByAmount(transaction.amount);
            if (amountMatch && amountMatch.confidence > bestMatch.confidence) {
                bestMatch = amountMatch;
            }
        }
        // Check historical data
        const historicalMatch = this.checkHistoricalData(merchant);
        if (historicalMatch && historicalMatch.confidence > bestMatch.confidence) {
            bestMatch = historicalMatch;
        }
        return bestMatch;
    }
    /**
     * Categorize based on transaction amount
     */
    categorizeByAmount(amount) {
        if (amount >= 1000) {
            return {
                name: 'CONFERENCE',
                confidence: 0.9,
                source: 'amount_threshold',
                details: { threshold: 1000, amount },
            };
        }
        return null;
    }
    /**
     * Check historical categorization data
     */
    checkHistoricalData(merchant) {
        const merchantKey = merchant.toLowerCase();
        const cached = this.merchantCache.get(merchantKey);
        if (cached) {
            return cached.category;
        }
        return null;
    }
    /**
     * Update historical categorization data
     */
    updateHistoricalData(merchant, category) {
        const merchantKey = merchant.toLowerCase();
        this.lastCategories.set(merchantKey, category);
        if (category.confidence > 0.8) {
            this.merchantCache.set(merchantKey, {
                category,
                processedAt: new Date(),
            });
        }
    }
    /**
     * Process a transaction with AI for categorization and enrichment
     */
    async processWithAI(transaction) {
        try {
            // First try local categorization
            const localCategory = this.categorizeTransaction(transaction);
            // If we have high confidence locally, use that
            if (localCategory.confidence > 0.8) {
                const aiData = {
                    category: localCategory,
                    processedAt: new Date(),
                };
                return (0, teller_1.updateTransactionWithAI)(transaction, aiData);
            }
            // Otherwise, call the backend AI service
            const response = await fetch(`${this.apiBaseUrl}/api/transactions/${transaction.id}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: transaction.description,
                    merchant: transaction.merchant,
                    amount: transaction.amount,
                    date: transaction.date,
                    localCategory,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to process transaction with AI');
            }
            const aiData = await response.json();
            // Update historical data with the result
            this.updateHistoricalData(transaction.merchant, aiData.category);
            return (0, teller_1.updateTransactionWithAI)(transaction, aiData);
        }
        catch (error) {
            console.error('Error processing transaction with AI:', error);
            throw error;
        }
    }
    /**
     * Process a batch of transactions with AI
     */
    async processBatchWithAI(transactions) {
        try {
            // First categorize all transactions locally
            const localCategories = transactions.map(tx => ({
                id: tx.id,
                category: this.categorizeTransaction(tx),
            }));
            // Filter transactions that need backend processing
            const needsBackendProcessing = localCategories.filter(item => item.category.confidence <= 0.8);
            if (needsBackendProcessing.length === 0) {
                // All transactions were categorized locally with high confidence
                return transactions.map(tx => {
                    const localCategory = localCategories.find(item => item.id === tx.id).category;
                    const aiData = {
                        category: localCategory,
                        processedAt: new Date(),
                    };
                    this.updateHistoricalData(tx.merchant, localCategory);
                    return (0, teller_1.updateTransactionWithAI)(tx, aiData);
                });
            }
            // Process remaining transactions with backend
            const response = await fetch(`${this.apiBaseUrl}/api/transactions/process-batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transactions.map(tx => ({
                    id: tx.id,
                    description: tx.description,
                    merchant: tx.merchant,
                    amount: tx.amount,
                    date: tx.date,
                    localCategory: localCategories.find(item => item.id === tx.id).category,
                }))),
            });
            if (!response.ok) {
                throw new Error('Failed to process transactions batch with AI');
            }
            const aiDataBatch = await response.json();
            return transactions.map(transaction => {
                const aiData = aiDataBatch.find(item => item.transactionId === transaction.id)?.data;
                if (!aiData) {
                    // Use local categorization if backend didn't process this transaction
                    const localCategory = localCategories.find(item => item.id === transaction.id).category;
                    const fallbackData = {
                        category: localCategory,
                        processedAt: new Date(),
                    };
                    this.updateHistoricalData(transaction.merchant, localCategory);
                    return (0, teller_1.updateTransactionWithAI)(transaction, fallbackData);
                }
                this.updateHistoricalData(transaction.merchant, aiData.category);
                return (0, teller_1.updateTransactionWithAI)(transaction, aiData);
            });
        }
        catch (error) {
            console.error('Error processing transactions batch with AI:', error);
            throw error;
        }
    }
    /**
     * Link a receipt to a transaction and extract data
     */
    async processReceiptForTransaction(transaction, receiptId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/transactions/${transaction.id}/receipt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ receiptId }),
            });
            if (!response.ok) {
                throw new Error('Failed to process receipt for transaction');
            }
            const updatedTransaction = await response.json();
            return updatedTransaction;
        }
        catch (error) {
            console.error('Error processing receipt for transaction:', error);
            throw error;
        }
    }
    /**
     * Reprocess a transaction with updated AI models
     */
    async reprocessTransaction(transaction) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/transactions/${transaction.id}/reprocess`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to reprocess transaction');
            }
            const updatedTransaction = await response.json();
            return updatedTransaction;
        }
        catch (error) {
            console.error('Error reprocessing transaction:', error);
            throw error;
        }
    }
    categorizeByMerchant(merchant) {
        const lowerMerchant = merchant.toLowerCase();
        // Software and subscriptions
        if (lowerMerchant.includes('github') ||
            lowerMerchant.includes('aws') ||
            lowerMerchant.includes('digitalocean')) {
            return {
                name: 'SOFTWARE_SUBSCRIPTIONS',
                confidence: 0.9,
                source: 'merchant_match',
                details: { merchant, keywords: ['github', 'aws', 'digitalocean'] },
            };
        }
        // Food and dining
        if (lowerMerchant.includes('restaurant') ||
            lowerMerchant.includes('cafe') ||
            lowerMerchant.includes('coffee')) {
            return {
                name: 'PERSONAL_MEALS',
                confidence: 0.8,
                source: 'merchant_match',
                details: { merchant, keywords: ['restaurant', 'cafe', 'coffee'] },
            };
        }
        // Travel
        if (lowerMerchant.includes('airline') ||
            lowerMerchant.includes('hotel') ||
            lowerMerchant.includes('airbnb')) {
            return {
                name: 'TRAVEL_HOTELS',
                confidence: 0.9,
                source: 'merchant_match',
                details: { merchant, keywords: ['airline', 'hotel', 'airbnb'] },
            };
        }
        if (lowerMerchant.includes('software') || lowerMerchant.includes('subscription')) {
            return {
                name: 'SOFTWARE_SUBSCRIPTIONS',
                confidence: 0.7,
                source: 'merchant_match',
                details: { merchant, keywords: ['software', 'subscription'] },
            };
        }
        return null;
    }
}
exports.default = TransactionEnrichmentService;
//# sourceMappingURL=TransactionEnrichmentService.js.map