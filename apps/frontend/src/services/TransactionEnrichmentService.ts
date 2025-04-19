import {
  type AIProcessedData,
  CATEGORY_DEFINITIONS,
  type CategoryResult,
  type TRANSACTION_CATEGORIES,
  TransactionCategory,
  updateTransactionWithAI,
} from "@/shared/types/teller";
import { TellerAccount, TellerTransaction, type Transaction } from "@fresh-expense/types";

interface CachedMerchantData {
  category: CategoryResult;
  processedAt?: Date;
}

class TransactionEnrichmentService {
  private static instance: TransactionEnrichmentService;
  private apiBaseUrl: string;
  private merchantCache: Map<string, CachedMerchantData> = new Map();
  private lastCategories: Map<string, CategoryResult> = new Map();

  private constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  }

  public static getInstance(): TransactionEnrichmentService {
    if (!TransactionEnrichmentService.instance) {
      TransactionEnrichmentService.instance = new TransactionEnrichmentService();
    }
    return TransactionEnrichmentService.instance;
  }

  /**
   * Calculate match score for categorization
   */
  private calculateMatchScore(text: string, keywords: string[], patterns: RegExp[] = []): number {
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
  private categorizeTransaction(transaction: Transaction): CategoryResult {
    const description = transaction.description?.toLowerCase() || "";
    const merchant = transaction.merchant.toLowerCase();
    const combinedText = `${merchant} ${description}`.toLowerCase();

    let bestMatch: CategoryResult = {
      name: "UNCATEGORIZED",
      confidence: 0.5,
      source: "default",
      details: { reason: "Initial categorization" },
    };

    // Check merchant cache first
    const cachedResult = this.merchantCache.get(merchant);
    if (cachedResult) {
      return cachedResult.category;
    }

    // Try each category definition
    for (const category of CATEGORY_DEFINITIONS) {
      const score = this.calculateMatchScore(combinedText, category.keywords, category.patterns);

      if (score > bestMatch.confidence) {
        bestMatch = {
          name: category.name as keyof typeof TRANSACTION_CATEGORIES,
          confidence: score,
          source: "pattern_match",
          details: {
            matchedText: combinedText.substring(0, 50) + "...",
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
  private categorizeByAmount(amount: number): CategoryResult | null {
    if (amount >= 1000) {
      return {
        name: "CONFERENCE",
        confidence: 0.9,
        source: "amount_threshold",
        details: { threshold: 1000, amount },
      };
    }
    return null;
  }

  /**
   * Check historical categorization data
   */
  private checkHistoricalData(merchant: string): CategoryResult | null {
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
  private updateHistoricalData(merchant: string, category: CategoryResult): void {
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
  public async processWithAI(transaction: Transaction): Promise<Transaction> {
    try {
      // First try local categorization
      const localCategory = this.categorizeTransaction(transaction);

      // If we have high confidence locally, use that
      if (localCategory.confidence > 0.8) {
        const aiData: AIProcessedData = {
          category: localCategory,
          processedAt: new Date(),
        };
        return updateTransactionWithAI(transaction, aiData);
      }

      // Otherwise, call the backend AI service
      const response = await fetch(
        `${this.apiBaseUrl}/api/transactions/${transaction.id}/process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: transaction.description,
            merchant: transaction.merchant,
            amount: transaction.amount,
            date: transaction.date,
            localCategory,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to process transaction with AI");
      }

      const aiData: AIProcessedData = await response.json();

      // Update historical data with the result
      this.updateHistoricalData(transaction.merchant, aiData.category);

      return updateTransactionWithAI(transaction, aiData);
    } catch (error) {
      console.error("Error processing transaction with AI:", error);
      throw error;
    }
  }

  /**
   * Process a batch of transactions with AI
   */
  public async processBatchWithAI(transactions: Transaction[]): Promise<Transaction[]> {
    try {
      // First categorize all transactions locally
      const localCategories = transactions.map((tx) => ({
        id: tx.id,
        category: this.categorizeTransaction(tx),
      }));

      // Filter transactions that need backend processing
      const needsBackendProcessing = localCategories.filter(
        (item) => item.category.confidence <= 0.8,
      );

      if (needsBackendProcessing.length === 0) {
        // All transactions were categorized locally with high confidence
        return transactions.map((tx) => {
          const localCategory = localCategories.find((item) => item.id === tx.id)!.category;
          const aiData: AIProcessedData = {
            category: localCategory,
            processedAt: new Date(),
          };
          this.updateHistoricalData(tx.merchant, localCategory);
          return updateTransactionWithAI(tx, aiData);
        });
      }

      // Process remaining transactions with backend
      const response = await fetch(`${this.apiBaseUrl}/api/transactions/process-batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          transactions.map((tx) => ({
            id: tx.id,
            description: tx.description,
            merchant: tx.merchant,
            amount: tx.amount,
            date: tx.date,
            localCategory: localCategories.find((item) => item.id === tx.id)!.category,
          })),
        ),
      });

      if (!response.ok) {
        throw new Error("Failed to process transactions batch with AI");
      }

      const aiDataBatch: { transactionId: string; data: AIProcessedData }[] = await response.json();

      return transactions.map((transaction) => {
        const aiData = aiDataBatch.find((item) => item.transactionId === transaction.id)?.data;
        if (!aiData) {
          // Use local categorization if backend didn't process this transaction
          const localCategory = localCategories.find(
            (item) => item.id === transaction.id,
          )!.category;
          const fallbackData: AIProcessedData = {
            category: localCategory,
            processedAt: new Date(),
          };
          this.updateHistoricalData(transaction.merchant, localCategory);
          return updateTransactionWithAI(transaction, fallbackData);
        }
        this.updateHistoricalData(transaction.merchant, aiData.category);
        return updateTransactionWithAI(transaction, aiData);
      });
    } catch (error) {
      console.error("Error processing transactions batch with AI:", error);
      throw error;
    }
  }

  /**
   * Link a receipt to a transaction and extract data
   */
  public async processReceiptForTransaction(
    transaction: Transaction,
    receiptId: string,
  ): Promise<Transaction> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/transactions/${transaction.id}/receipt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ receiptId }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to process receipt for transaction");
      }

      const updatedTransaction: Transaction = await response.json();
      return updatedTransaction;
    } catch (error) {
      console.error("Error processing receipt for transaction:", error);
      throw error;
    }
  }

  /**
   * Reprocess a transaction with updated AI models
   */
  public async reprocessTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/transactions/${transaction.id}/reprocess`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to reprocess transaction");
      }

      const updatedTransaction: Transaction = await response.json();
      return updatedTransaction;
    } catch (error) {
      console.error("Error reprocessing transaction:", error);
      throw error;
    }
  }

  private categorizeByMerchant(merchant: string): CategoryResult | null {
    const lowerMerchant = merchant.toLowerCase();

    // Software and subscriptions
    if (
      lowerMerchant.includes("github") ||
      lowerMerchant.includes("aws") ||
      lowerMerchant.includes("digitalocean")
    ) {
      return {
        name: "SOFTWARE_SUBSCRIPTIONS",
        confidence: 0.9,
        source: "merchant_match",
        details: { merchant, keywords: ["github", "aws", "digitalocean"] },
      };
    }

    // Food and dining
    if (
      lowerMerchant.includes("restaurant") ||
      lowerMerchant.includes("cafe") ||
      lowerMerchant.includes("coffee")
    ) {
      return {
        name: "PERSONAL_MEALS",
        confidence: 0.8,
        source: "merchant_match",
        details: { merchant, keywords: ["restaurant", "cafe", "coffee"] },
      };
    }

    // Travel
    if (
      lowerMerchant.includes("airline") ||
      lowerMerchant.includes("hotel") ||
      lowerMerchant.includes("airbnb")
    ) {
      return {
        name: "TRAVEL_HOTELS",
        confidence: 0.9,
        source: "merchant_match",
        details: { merchant, keywords: ["airline", "hotel", "airbnb"] },
      };
    }

    if (lowerMerchant.includes("software") || lowerMerchant.includes("subscription")) {
      return {
        name: "SOFTWARE_SUBSCRIPTIONS",
        confidence: 0.7,
        source: "merchant_match",
        details: { merchant, keywords: ["software", "subscription"] },
      };
    }

    return null;
  }
}

export default TransactionEnrichmentService;
