import type { ReceiptRepository } from "@fresh-expense/core";
import type { ReceiptDocument } from "@fresh-expense/types";
import { type ReceiptMatchScore, calculateReceiptMatchScore } from "@fresh-expense/utils";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";
import type { CacheService } from "../cache/cache.service";
import type { R2Service } from "../storage/r2.service";

export interface ReceiptSearchOptions {
  userId: string;
  query?: string;
  merchant?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  tags?: string[];
  source?: "CSV" | "EMAIL" | "GOOGLE_PHOTOS" | "MANUAL";
  fuzzyMatch?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "date" | "amount" | "merchant";
  sortOrder?: "asc" | "desc";
}

export interface ReceiptMatchResult {
  receipt: ReceiptDocument;
  score: number;
  matchDetails: ReceiptMatchScore;
}

export interface BatchOperationResult {
  success: boolean;
  message: string;
  affectedIds: string[];
  errors?: Array<{ id: string; error: string }>;
}

@Injectable()
export class ReceiptFinderService {
  private readonly logger = new Logger(ReceiptFinderService.name);
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    @InjectModel("Receipt") private receiptModel: Model<ReceiptDocument>,
    private readonly r2Service: R2Service,
    private readonly cacheService: CacheService,
    private readonly receiptRepository: ReceiptRepository,
  ) {}

  async findReceipts(options: ReceiptSearchOptions): Promise<ReceiptDocument[]> {
    try {
      // Generate cache key based on search options
      const cacheKey = this.generateCacheKey(options);

      // Try to get from cache first
      const cachedResults = await this.cacheService.get<ReceiptDocument[]>(cacheKey);
      if (cachedResults) {
        return cachedResults;
      }

      const query: any = { userId: new Types.ObjectId(options.userId) };

      // Text search
      if (options.query) {
        if (options.fuzzyMatch) {
          const searchRegex = new RegExp(options.query.split("").join(".*"), "i");
          query.$or = [
            { merchant: searchRegex },
            { "metadata.text": searchRegex },
            { "ocrData.text": searchRegex },
          ];
        } else {
          query.$text = { $search: options.query };
        }
      }

      // Merchant search
      if (options.merchant) {
        if (options.fuzzyMatch) {
          query.merchant = new RegExp(options.merchant.split("").join(".*"), "i");
        } else {
          query.merchant = options.merchant;
        }
      }

      // Amount range
      if (options.minAmount !== undefined || options.maxAmount !== undefined) {
        query.amount = {};
        if (options.minAmount !== undefined) {
          query.amount.$gte = options.minAmount;
        }
        if (options.maxAmount !== undefined) {
          query.amount.$lte = options.maxAmount;
        }
      }

      // Date range
      if (options.startDate || options.endDate) {
        query.date = {};
        if (options.startDate) {
          query.date.$gte = options.startDate;
        }
        if (options.endDate) {
          query.date.$lte = options.endDate;
        }
      }

      // Categories
      if (options.categories?.length) {
        query.category = { $in: options.categories };
      }

      // Tags
      if (options.tags?.length) {
        query.tags = { $all: options.tags };
      }

      // Source
      if (options.source) {
        query.source = options.source;
      }

      // Sort options
      const sortOptions: any = {};
      if (options.sortBy) {
        sortOptions[options.sortBy] = options.sortOrder != null ? 1 : -1;
      } else {
        sortOptions.date = -1; // Default sort by date descending
      }

      const receipts = await this.receiptModel
        .find(query)
        .sort(sortOptions)
        .skip(options.offset || 0)
        .limit(options.limit || 50)
        .exec();

      // Update signed URLs
      await this.updateSignedUrls(receipts);

      // Cache the results
      await this.cacheService.set(cacheKey, receipts, { ttl: this.CACHE_TTL });

      return receipts;
    } catch (error) {
      this.logger.error("Error finding receipts:", error);
      throw error;
    }
  }

  async findSimilarReceipts(receipt: ReceiptDocument): Promise<ReceiptMatchResult[]> {
    if (!this.hasRequiredFields(receipt)) {
      throw new Error("Receipt is missing required fields");
    }

    const cacheKey = `similar:${receipt._id}`;
    const cachedResults = await this.cacheService.get<ReceiptMatchResult[]>(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }

    const merchantPattern = new RegExp(receipt.merchant.split("").join(".*"), "i");

    const query = {
      userId: receipt.userId,
      _id: { $ne: receipt._id },
      $or: [
        { merchant: merchantPattern },
        {
          amount: {
            $gte: receipt.amount * 0.9,
            $lte: receipt.amount * 1.1,
          },
        },
      ],
    };

    const similarReceipts = await this.receiptModel.find(query).exec();
    const results: ReceiptMatchResult[] = [];

    for (const similar of similarReceipts) {
      if (!this.hasRequiredFields(similar)) {
        continue;
      }
      const matchScore = this.calculateMatchScore(receipt, similar);
      if (matchScore.score > 0.3) {
        results.push(matchScore);
      }
    }

    results.sort((a, b) => b.score - a.score);

    await this.updateMatchResultUrls(results);
    await this.cacheService.set(cacheKey, results, { ttl: this.CACHE_TTL });

    return results;
  }

  async batchDelete(receiptIds: string[], userId: string): Promise<BatchOperationResult> {
    try {
      const result: BatchOperationResult = {
        success: true,
        message: "Successfully deleted receipts",
        affectedIds: [],
        errors: [],
      };

      for (const id of receiptIds) {
        try {
          const receipt = await this.receiptModel.findOne({
            _id: new Types.ObjectId(id),
            userId: new Types.ObjectId(userId),
          });

          if (!receipt) {
            result.errors?.push({ id, error: "Receipt not found" });
            continue;
          }

          // Delete from R2
          await this.r2Service.deleteObject(receipt.r2Key);
          if (receipt.r2ThumbnailKey) {
            await this.r2Service.deleteObject(receipt.r2ThumbnailKey);
          }

          // Delete from database
          await this.receiptModel.deleteOne({ _id: receipt._id });
          result.affectedIds.push(id);

          // Clear relevant caches
          await this.clearReceiptCaches(receipt);
        } catch (error) {
          result.success = false;
          result.errors?.push({ id, error: error.message });
        }
      }

      return result;
    } catch (error) {
      this.logger.error("Error in batch delete:", error);
      throw error;
    }
  }

  async batchCategorize(
    receiptIds: string[],
    userId: string,
    category: string,
  ): Promise<BatchOperationResult> {
    try {
      const result: BatchOperationResult = {
        success: true,
        message: "Successfully categorized receipts",
        affectedIds: [],
        errors: [],
      };

      for (const id of receiptIds) {
        try {
          const receipt = await this.receiptModel.findOne({
            _id: new Types.ObjectId(id),
            userId: new Types.ObjectId(userId),
          });

          if (!receipt) {
            result.errors?.push({ id, error: "Receipt not found" });
            continue;
          }

          receipt.category = category;
          await receipt.save();
          result.affectedIds.push(id);

          // Clear relevant caches
          await this.clearReceiptCaches(receipt);
        } catch (error) {
          result.success = false;
          result.errors?.push({ id, error: error.message });
        }
      }

      return result;
    } catch (error) {
      this.logger.error("Error in batch categorize:", error);
      throw error;
    }
  }

  private async clearReceiptCaches(receipt: ReceiptDocument) {
    const cacheKeys = [
      `similar:${receipt._id}`,
      `receipt:${receipt._id}`,
      `user:${receipt.userId}:receipts`,
    ];
    await Promise.all(cacheKeys.map((key) => this.cacheService.delete(key)));
  }

  private generateCacheKey(options: ReceiptSearchOptions): string {
    const keyParts = [
      "receipts",
      options.userId,
      options.query,
      options.merchant,
      options.minAmount,
      options.maxAmount,
      options.startDate?.toISOString(),
      options.endDate?.toISOString(),
      options.categories?.join(","),
      options.tags?.join(","),
      options.source,
      options.fuzzyMatch,
      options.limit,
      options.offset,
      options.sortBy,
      options.sortOrder,
    ];
    return keyParts.filter(Boolean).join(":");
  }

  private async updateSignedUrls(receipts: ReceiptDocument[]): Promise<void> {
    for (const receipt of receipts) {
      if (receipt.r2Key) {
        receipt.fullImageUrl = await this.r2Service.getSignedUrl(receipt.r2Key);
      }
      if (receipt.r2ThumbnailKey) {
        receipt.thumbnailUrl = await this.r2Service.getSignedUrl(receipt.r2ThumbnailKey);
      }
    }
  }

  private async updateMatchResultUrls(results: ReceiptMatchResult[]): Promise<void> {
    for (const result of results) {
      if (result.receipt.r2Key) {
        result.receipt.fullImageUrl = await this.r2Service.getSignedUrl(result.receipt.r2Key);
      }
      if (result.receipt.r2ThumbnailKey) {
        result.receipt.thumbnailUrl = await this.r2Service.getSignedUrl(
          result.receipt.r2ThumbnailKey,
        );
      }
    }
  }

  private hasRequiredFields(
    receipt: ReceiptDocument,
  ): receipt is ReceiptDocument & { _id: Types.ObjectId } {
    return (
      receipt !== null &&
      receipt !== undefined &&
      receipt._id instanceof Types.ObjectId &&
      typeof receipt.merchant === "string" &&
      receipt.merchant.length > 0 &&
      typeof receipt.amount === "number" &&
      receipt.date instanceof Date &&
      receipt.userId instanceof Types.ObjectId &&
      typeof receipt.r2Key === "string"
    );
  }

  private calculateMatchScore(
    receipt1: ReceiptDocument,
    receipt2: ReceiptDocument,
  ): ReceiptMatchResult {
    if (!this.hasRequiredFields(receipt1) || !this.hasRequiredFields(receipt2)) {
      throw new Error("Receipts missing required fields for comparison");
    }

    const matchScore = calculateReceiptMatchScore(
      {
        merchantName: receipt1.merchant,
        amount: receipt1.amount,
        date: receipt1.date,
      },
      {
        id: receipt2._id.toString(),
        accountId: receipt2.userId.toString(),
        merchantName: receipt2.merchant,
        amount: receipt2.amount,
        date: receipt2.date,
        description: receipt2.description || "",
        type: "debit",
        status: "matched",
      },
    );

    return {
      receipt: receipt2,
      score: matchScore.score,
      matchDetails: matchScore,
    };
  }

  async findById(id: string, userId: string): Promise<Receipt> {
    try {
      const receipt = await this.receiptRepository.findById(id);
      if (!receipt || receipt.userId !== userId) {
        throw new NotFoundException("Receipt not found");
      }
      return receipt;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error finding receipt by ID: ${error.message}`);
      }
      throw new NotFoundException("Receipt not found");
    }
  }
}
