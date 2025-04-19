import { ExpenseCategory } from "@fresh-expense/types";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Cache } from "cache-manager";
import type { MerchantLearningService } from "./merchant-learning.service";

// Define types locally since they're not available in the types package
type MerchantSource = "manual" | "ocr" | "transaction" | "api";

interface MerchantLearningData {
  merchantName: string;
  userId: string;
  source: MerchantSource;
  confidence: number;
  category: ExpenseCategory;
  metadata: {
    transactionCount: number;
    totalAmount?: number;
    averageAmount?: number;
    tags?: string[];
  };
}

interface MerchantLearningResult {
  merchantName: string;
  category: ExpenseCategory;
  confidence: number;
  source: MerchantSource;
  metadata?: Record<string, unknown>;
}

interface ITransactionRepository {
  getMerchantStats(
    merchantName: string,
    userId: string,
  ): Promise<{
    transactionCount: number;
    totalAmount: number;
    averageAmount: number;
    categories: Record<string, number>;
    tags: string[];
  }>;
}

interface UnifiedReceiptProcessorService {
  processReceipt(params: {
    merchantName: string;
    userId: string;
    source: string;
  }): Promise<{
    confidence?: number;
    category: ExpenseCategory;
    transactionCount?: number;
    tags?: string[];
  }>;
}

@Injectable()
export class MerchantCategorizationService {
  private readonly logger = new Logger(MerchantCategorizationService.name);
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly merchantLearningService: MerchantLearningService,
    private readonly receiptProcessor: UnifiedReceiptProcessorService,
    private readonly transactionRepository: ITransactionRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * Categorize a merchant based on multiple data sources
   * @param merchantName The merchant name to categorize
   * @param userId The user ID
   * @param sources Optional array of data sources to use
   * @returns Promise<MerchantLearningResult>
   */
  async categorizeMerchant(
    merchantName: string,
    userId: string,
    sources: MerchantSource[] = ["manual", "ocr", "transaction", "api"],
  ): Promise<MerchantLearningResult> {
    try {
      // Check cache first
      const cacheKey = `merchant:${userId}:${merchantName}`;
      const cachedResult = await this.cacheManager.get<MerchantLearningResult>(cacheKey);
      if (cachedResult) {
        this.logger.debug(`Cache hit for merchant: ${merchantName}`);
        return cachedResult;
      }

      // Collect data from different sources
      const learningDataPromises = sources.map((source) =>
        this.getDataFromSource(merchantName, userId, source),
      );

      const results = await Promise.all(learningDataPromises);
      const validData = results.filter((data): data is MerchantLearningData => data !== null);

      if (validData.length === 0) {
        this.logger.warn(`No valid data found for merchant: ${merchantName}`);
        return this.getDefaultResult(merchantName, userId);
      }

      // Use the highest confidence result
      const bestResult = validData.reduce((best, current) =>
        current.confidence > best.confidence ? current : best,
      );

      const result = await this.merchantLearningService.learnFromData(bestResult);

      // Cache the result
      await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);

      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Error categorizing merchant ${merchantName}: ${errorMessage}`);
      return this.getDefaultResult(merchantName, userId);
    }
  }

  /**
   * Get merchant data from a specific source
   * @param merchantName The merchant name
   * @param userId The user ID
   * @param source The data source
   * @returns Promise<MerchantLearningData | null>
   */
  private async getDataFromSource(
    merchantName: string,
    userId: string,
    source: MerchantSource,
  ): Promise<MerchantLearningData | null> {
    try {
      switch (source) {
        case "ocr":
          return await this.getDataFromOCR(merchantName, userId);
        case "transaction":
          return await this.getDataFromTransactions(merchantName, userId);
        case "api":
          return await this.getDataFromAPI(merchantName, userId);
        default:
          return this.getDefaultData(merchantName, userId);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.warn(`Failed to get data from ${source} for ${merchantName}: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Get merchant data from OCR processing
   */
  private async getDataFromOCR(
    merchantName: string,
    userId: string,
  ): Promise<MerchantLearningData> {
    const receiptData = await this.receiptProcessor.processReceipt({
      merchantName,
      userId,
      source: "ocr",
    });

    return {
      merchantName,
      userId,
      source: "ocr",
      confidence: receiptData.confidence || 0.7,
      category: receiptData.category,
      metadata: {
        transactionCount: receiptData.transactionCount || 0,
        tags: receiptData.tags || [],
      },
    };
  }

  /**
   * Get merchant data from transaction history
   */
  private async getDataFromTransactions(
    merchantName: string,
    userId: string,
  ): Promise<MerchantLearningData> {
    try {
      const stats = await this.transactionRepository.getMerchantStats(merchantName, userId);

      if (stats.transactionCount === 0) {
        return this.getDefaultData(merchantName, userId);
      }

      // Calculate confidence based on transaction count and consistency
      const baseConfidence = Math.min(0.9, 0.5 + stats.transactionCount * 0.1);
      const categoryConsistency = this.calculateCategoryConsistency(stats.categories);
      const finalConfidence = baseConfidence * categoryConsistency;

      // Get most common category
      const mostCommonCategory =
        (Object.entries(stats.categories).sort(
          ([, a], [, b]) => b - a,
        )[0]?.[0] as ExpenseCategory) || ExpenseCategory.OTHER;

      return {
        merchantName,
        userId,
        source: "transaction",
        confidence: finalConfidence,
        category: mostCommonCategory,
        metadata: {
          transactionCount: stats.transactionCount,
          totalAmount: stats.totalAmount,
          averageAmount: stats.averageAmount,
          tags: stats.tags,
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Error getting transaction data for ${merchantName}: ${errorMessage}`);
      return this.getDefaultData(merchantName, userId);
    }
  }

  /**
   * Calculate category consistency score
   */
  private calculateCategoryConsistency(categories: Record<string, number>): number {
    const total = Object.values(categories).reduce((sum, count) => sum + count, 0);
    if (total === 0) return 0;

    const maxCount = Math.max(...Object.values(categories));
    return maxCount / total;
  }

  /**
   * Get merchant data from external API
   */
  private async getDataFromAPI(
    merchantName: string,
    userId: string,
  ): Promise<MerchantLearningData> {
    // TODO: Implement external API integration
    return this.getDefaultData(merchantName, userId);
  }

  /**
   * Get default merchant data
   */
  private getDefaultData(merchantName: string, userId: string): MerchantLearningData {
    return {
      merchantName,
      userId,
      source: "manual",
      confidence: 0.5,
      category: ExpenseCategory.OTHER,
      metadata: {
        transactionCount: 0,
      },
    };
  }

  /**
   * Get default result when categorization fails
   */
  private getDefaultResult(merchantName: string, userId: string): MerchantLearningResult {
    return {
      merchantName,
      category: ExpenseCategory.OTHER,
      confidence: 0.5,
      source: "manual",
    };
  }
}
