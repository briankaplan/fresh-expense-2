import {
  type AICategorizationRequestDto,
  type AICategorizationResponseDto,
  type AICategorizedTransactionDto,
  type CategorizationConfig,
  CategorizationValidationRules,
  type ITransactionCategorizationService,
  type MerchantData,
  type TransactionCategorizationEvent,
  type TransactionDocument,
  type TransactionPatterns,
  type TransactionUpdateDto,
} from "@fresh-expense/types";
import { Injectable, Logger } from "@nestjs/common";
import type { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";

import type { MerchantLearningService } from "../merchant/merchant-learning.service";

@Injectable()
export class TransactionCategorizationService implements ITransactionCategorizationService {
  private readonly logger = new Logger(TransactionCategorizationService.name);
  private config: CategorizationConfig = {
    confidenceThreshold: 0.8,
    maxBatchSize: 100,
    autoApply: true,
    preserveExisting: true,
  };

  constructor(
    @InjectModel("Transaction")
    private transactionModel: Model<TransactionDocument>,
    private readonly merchantLearning: MerchantLearningService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Categorizes a batch of transactions using AI
   */
  async categorizeTransactions(
    request: AICategorizationRequestDto,
  ): Promise<AICategorizationResponseDto> {
    this.validateRequest(request);

    const transactions = await this.transactionModel
      .find({ _id: { $in: request.transactionIds } })
      .limit(this.config.maxBatchSize);

    const results: AICategorizedTransactionDto[] = [];
    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalConfidence = 0;

    for (const transaction of transactions) {
      try {
        const categorization = await this.processTransaction(transaction);
        const wasUpdated = this.shouldUpdate(categorization, request);

        results.push({
          transactionId: transaction._id.toString(),
          categorization,
          wasUpdated,
          error: wasUpdated ? undefined : "Confidence below threshold",
        });

        totalProcessed++;
        if (wasUpdated) {
          totalUpdated++;
          totalConfidence += categorization.confidence;
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        this.logger.error(
          `Failed to process transaction ${transaction._id.toString()}: ${errorMessage}`,
        );
        results.push({
          transactionId: transaction._id.toString(),
          categorization: null,
          wasUpdated: false,
          error: errorMessage,
        });
      }
    }

    return {
      results,
      totalProcessed,
      totalUpdated,
      averageConfidence: totalUpdated > 0 ? totalConfidence / totalUpdated : 0,
    };
  }

  /**
   * Applies categorization results to transactions
   */
  async applyCategorization(updates: TransactionUpdateDto[]): Promise<number> {
    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.transactionId },
        update: {
          $set: {
            category: update.category,
            company: update.company,
            tags: update.tags,
            description: update.description,
            "metadata.confidence": update.confidence,
          },
        },
      },
    }));

    const result = await this.transactionModel.bulkWrite(bulkOps);
    return result.modifiedCount;
  }

  /**
   * Validates categorization results against confidence thresholds
   */
  validateConfidence(
    result: AICategorizationResponseDto,
    threshold: number = this.config.confidenceThreshold,
  ): boolean {
    return result.averageConfidence >= threshold;
  }

  private validateRequest(request: AICategorizationRequestDto): void {
    if (!request.transactionIds?.length) {
      throw new Error("No transaction IDs provided");
    }

    if (request.transactionIds.length > this.config.maxBatchSize) {
      throw new Error(`Batch size exceeds maximum of ${this.config.maxBatchSize}`);
    }

    if (request.confidenceThreshold && !this.isValidConfidence(request.confidenceThreshold)) {
      throw new Error("Invalid confidence threshold");
    }
  }

  private isValidConfidence(threshold: number): boolean {
    return threshold >= 0 && threshold <= 1;
  }

  private async processTransaction(
    transaction: TransactionDocument,
  ): Promise<AICategorizationResultDto> {
    try {
      // 1. Get merchant learning data
      const merchantData = (await this.merchantLearning.getMerchantData(
        transaction.merchantName,
      )) as MerchantData;

      // 2. Analyze transaction patterns
      const patterns = await this.analyzeTransactionPatterns(transaction);

      // 3. Determine category based on merchant and patterns
      const category = await this.determineCategory(transaction, merchantData, patterns);

      // 4. Determine company based on merchant and patterns
      const company = await this.determineCompany(transaction, merchantData, patterns);

      // 5. Generate relevant tags
      const tags = await this.generateTags(transaction, merchantData, patterns);

      // 6. Calculate confidence score
      const confidence = this.calculateConfidence(merchantData, patterns, category, company);

      // 7. Generate enhanced description
      const description = await this.generateDescription(transaction, merchantData, patterns);

      // Emit event for learning
      const event: TransactionCategorizationEvent = {
        transactionId: transaction._id.toString(),
        merchant: transaction.merchantName,
        category,
        company,
        confidence,
        patterns,
      };
      this.eventEmitter.emit("transaction.categorized", event);

      return {
        category,
        company,
        tags,
        confidence,
        description,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Failed to process transaction ${transaction._id.toString()}: ${errorMessage}`,
      );
      throw error;
    }
  }

  private async analyzeTransactionPatterns(
    transaction: TransactionDocument,
  ): Promise<TransactionPatterns> {
    // Get similar transactions for pattern analysis
    const similarTransactions = await this.transactionModel
      .find({
        merchantName: transaction.merchantName,
        _id: { $ne: transaction._id },
      })
      .sort({ date: -1 })
      .limit(10);

    // Analyze frequency and amounts
    const frequency = similarTransactions.length;
    const averageAmount =
      frequency > 0 ? similarTransactions.reduce((sum, t) => sum + t.amount, 0) / frequency : 0;
    const isRecurring = frequency > 1 && this.isRegularInterval(similarTransactions);

    return {
      frequency,
      averageAmount,
      isRecurring,
      lastTransaction: similarTransactions[0]?.date,
      amountDeviation:
        frequency > 0 ? Math.abs(transaction.amount - averageAmount) / averageAmount : 0,
    };
  }

  private async determineCategory(
    transaction: TransactionDocument,
    merchantData: MerchantData,
    patterns: TransactionPatterns,
  ): Promise<string> {
    // 1. Check merchant's known category
    if (merchantData?.category && merchantData.confidence && merchantData.confidence > 0.9) {
      return merchantData.category;
    }

    // 2. Check transaction patterns
    if (patterns.isRecurring) {
      return "Subscription";
    }

    // 3. Use amount-based categorization
    if (transaction.amount > 1000) {
      return "Major Purchase";
    }

    // 4. Default to merchant's category or 'Other'
    return merchantData?.category || "Other";
  }

  private async determineCompany(
    transaction: TransactionDocument,
    merchantData: MerchantData,
    patterns: TransactionPatterns,
  ): Promise<"Down Home" | "Music City Rodeo" | "Personal"> {
    // 1. Check merchant's known company
    if (merchantData?.company && merchantData.confidence && merchantData.confidence > 0.9) {
      return merchantData.company;
    }

    // 2. Use pattern-based determination
    if (patterns.isRecurring && patterns.frequency > 3) {
      return "Down Home"; // Default for recurring business expenses
    }

    // 3. Use amount-based determination
    if (transaction.amount > 500) {
      return "Down Home"; // Large expenses likely business
    }

    // 4. Default to Personal
    return "Personal";
  }

  private async generateTags(
    transaction: TransactionDocument,
    merchantData: MerchantData,
    patterns: TransactionPatterns,
  ): Promise<string[]> {
    const tags = new Set<string>();

    // Add merchant-based tags
    if (merchantData?.tags) {
      merchantData.tags.forEach((tag) => tags.add(tag));
    }

    // Add pattern-based tags
    if (patterns.isRecurring) {
      tags.add("recurring");
    }
    if (patterns.amountDeviation < 0.1) {
      tags.add("consistent-amount");
    }

    // Add amount-based tags
    if (transaction.amount > 1000) {
      tags.add("large-purchase");
    } else if (transaction.amount < 10) {
      tags.add("small-purchase");
    }

    return Array.from(tags);
  }

  private calculateConfidence(
    merchantData: MerchantData,
    patterns: TransactionPatterns,
    category: string,
    company: string,
  ): number {
    let confidence = 0;

    // Merchant data confidence
    if (merchantData?.confidence) {
      confidence += merchantData.confidence * 0.4;
    }

    // Pattern confidence
    if (patterns.isRecurring) {
      confidence += 0.3;
    }
    if (patterns.amountDeviation < 0.1) {
      confidence += 0.2;
    }

    // Category confidence
    if (category !== "Other") {
      confidence += 0.1;
    }

    return Math.min(confidence, 1);
  }

  private async generateDescription(
    transaction: TransactionDocument,
    merchantData: MerchantData,
    patterns: TransactionPatterns,
  ): Promise<string> {
    let description = transaction.description || "";

    // Enhance with merchant data
    if (merchantData?.description) {
      description = merchantData.description;
    }

    // Add pattern information
    if (patterns.isRecurring) {
      description += ` (Recurring payment${patterns.frequency > 1 ? `, ${patterns.frequency} occurrences` : ""})`;
    }

    return description;
  }

  private isRegularInterval(transactions: TransactionDocument[]): boolean {
    if (transactions.length < 2) return false;

    const intervals: number[] = [];
    for (let i = 1; i < transactions.length; i++) {
      const prevTransaction = transactions[i - 1];
      const currentTransaction = transactions[i];
      if (prevTransaction?.date && currentTransaction?.date) {
        const interval = prevTransaction.date.getTime() - currentTransaction.date.getTime();
        intervals.push(interval);
      }
    }

    if (intervals.length === 0) return false;

    const averageInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const deviation =
      intervals.reduce((sum, i) => sum + Math.abs(i - averageInterval), 0) / intervals.length;

    return deviation / averageInterval < 0.2; // Less than 20% deviation
  }

  private shouldUpdate(
    categorization: AICategorizationResultDto,
    request: AICategorizationRequestDto,
  ): boolean {
    const threshold = request.confidenceThreshold ?? this.config.confidenceThreshold;
    return categorization.confidence >= threshold;
  }
}
