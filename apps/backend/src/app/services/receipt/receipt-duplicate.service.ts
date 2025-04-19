import type { ReceiptDocument } from "@fresh-expense/types";
import { Injectable, Logger } from "@nestjs/common";
import type { ReceiptMatcherService } from "./receipt-matcher.service";
import type { ReceiptStorageService } from "./receipt-storage.service";

interface DuplicateReceipt {
  receipt: ReceiptDocument;
  confidence: number;
  matchDetails: {
    merchantScore: number;
    amountScore: number;
    dateScore: number;
    totalScore: number;
  };
}

interface MergeOptions {
  keepOriginal: boolean;
  mergeMetadata: boolean;
  mergeItems: boolean;
  mergeTags: boolean;
}

@Injectable()
export class ReceiptDuplicateService {
  private readonly logger = new Logger(ReceiptDuplicateService.name);
  private readonly DEFAULT_CONFIDENCE_THRESHOLD = 0.9;

  constructor(
    private readonly receiptMatcher: ReceiptMatcherService,
    private readonly storageService: ReceiptStorageService,
  ) {}

  async findDuplicates(receipt: ReceiptDocument): Promise<DuplicateReceipt[]> {
    try {
      const similarReceipts = await this.receiptMatcher.findSimilarReceipts(receipt);
      return similarReceipts
        .filter((r) => r.score >= this.DEFAULT_CONFIDENCE_THRESHOLD)
        .map((r) => ({
          receipt: r.receipt,
          confidence: r.score,
          matchDetails: r.matchDetails,
        }));
    } catch (error) {
      this.logger.error("Error finding duplicates:", error);
      throw error;
    }
  }

  async mergeReceipts(
    original: ReceiptDocument,
    duplicate: ReceiptDocument,
    options: Partial<MergeOptions> = {},
  ): Promise<ReceiptDocument> {
    try {
      const finalOptions: MergeOptions = {
        keepOriginal: true,
        mergeMetadata: true,
        mergeItems: true,
        mergeTags: true,
        ...options,
      };

      // Update the original receipt with information from the duplicate
      if (finalOptions.mergeMetadata && duplicate.metadata) {
        original.metadata = {
          ...original.metadata,
          ...duplicate.metadata,
          duplicateCount: (original.metadata?.duplicateCount || 0) + 1,
          lastSeen: new Date(),
        };
      }

      if (finalOptions.mergeItems && duplicate.items?.length) {
        original.items = [...(original.items || []), ...duplicate.items];
      }

      if (finalOptions.mergeTags && duplicate.tags?.length) {
        const uniqueTags = new Set([...(original.tags || []), ...duplicate.tags]);
        original.tags = Array.from(uniqueTags);
      }

      // Record the merge in the original receipt's history
      if (!original.duplicateMatches) {
        original.duplicateMatches = [];
      }

      original.duplicateMatches.push({
        receiptId: duplicate._id,
        confidence: this.DEFAULT_CONFIDENCE_THRESHOLD,
        matchedAt: new Date(),
        matchDetails: {
          merchantScore: 1,
          amountScore: 1,
          dateScore: 1,
          totalScore: 1,
        },
      });

      // Save the updated original receipt
      await original.save();

      // If we're not keeping the original, delete the duplicate
      if (!finalOptions.keepOriginal) {
        await this.deleteDuplicate(duplicate);
      }

      return original;
    } catch (error) {
      this.logger.error("Error merging receipts:", error);
      throw error;
    }
  }

  async deleteDuplicate(receipt: ReceiptDocument): Promise<void> {
    try {
      // Delete from storage
      await this.storageService.deleteFile(receipt.r2Key);
      if (receipt.r2ThumbnailKey) {
        await this.storageService.deleteFile(receipt.r2ThumbnailKey);
      }

      // Mark as deleted in database
      receipt.status = "deleted";
      receipt.deletedAt = new Date();
      await receipt.save();
    } catch (error) {
      this.logger.error("Error deleting duplicate receipt:", error);
      throw error;
    }
  }

  async cleanupDuplicates(): Promise<void> {
    try {
      const duplicates = await this.receiptMatcher.findSimilarReceipts({
        status: "processed",
        duplicateCount: { $gt: 0 },
      });

      for (const duplicate of duplicates) {
        if (duplicate.score >= this.DEFAULT_CONFIDENCE_THRESHOLD) {
          await this.mergeReceipts(duplicate.receipt, duplicate.receipt, {
            keepOriginal: true,
          });
        }
      }
    } catch (error) {
      this.logger.error("Error cleaning up duplicates:", error);
      throw error;
    }
  }
}
