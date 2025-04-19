import type { ReceiptDocument } from "@fresh-expense/types";
import { type BaseTransactionData, OCRResult } from "@fresh-expense/types";
import {
  ReceiptMatchScore,
  calculateAmountMatchScore,
  calculateDateMatchScore,
  calculateMerchantMatchScore,
  calculateReceiptMatchScore,
  findBestMatchingTransaction,
} from "@fresh-expense/utils/src/receipt/receipt-matching";
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cron, CronExpression } from "@nestjs/schedule";
import { type Model, Types } from "mongoose";
import type { OCRService } from "../../services/ocr/ocr.service";
import type { R2Service } from "../../services/r2/r2.service";

// Define MatchScoreDetails locally since it's not exported
interface MatchScoreDetails {
  merchantScore: number;
  amountScore: number;
  dateScore: number;
  totalScore: number;
}

// Define ReceiptMatchingOptions locally since it's not exported
interface ReceiptMatchingOptions {
  minScore?: number;
  maxDaysDifference?: number;
  amountTolerance?: number;
}

interface MatchResult {
  receipt: ReceiptDocument;
  transaction: BaseTransactionData;
  confidence: number;
  matchDetails: MatchScoreDetails;
}

interface ReceiptData {
  merchantName: string;
  amount: number;
  date: Date;
}

// Add new types for receipt-specific transactions
type ReceiptTransactionType = "debit" | "credit" | "receipt";
type ReceiptTransactionStatus = "pending" | "posted" | "canceled" | "unmatched";

// Extend BaseTransactionData for receipts
interface ReceiptTransactionData extends Omit<BaseTransactionData, "type" | "status"> {
  type: ReceiptTransactionType;
  status: ReceiptTransactionStatus;
}

interface Receipt {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  r2Key: string;
  r2ThumbnailKey: string;
  status: string;
  metadata: {
    mimeType: string;
    size: number;
    processedAt: Date;
  };
  ocrData: any;
  merchant: string;
  amount: number;
  date: Date;
  duplicateCount?: number;
  lastSeen?: Date;
  duplicateMatches?: Array<{
    receiptId: Types.ObjectId;
    confidence: number;
    matchedAt: Date;
    matchDetails: MatchScoreDetails;
  }>;
}

@Injectable()
export class ReceiptBankService {
  private readonly logger = new Logger(ReceiptBankService.name);

  constructor(
    @InjectModel("Receipt") private receiptModel: Model<ReceiptDocument>,
    private readonly r2Service: R2Service,
    private readonly ocrService: OCRService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async processUnmatchedReceipts() {
    try {
      const unmatchedReceipts = await this.receiptModel.find({ status: "unmatched" }).exec();

      this.logger.log(`Processing ${unmatchedReceipts.length} unmatched receipts`);

      for (const receipt of unmatchedReceipts) {
        await this.findMatchesForReceipt(receipt);
      }
    } catch (error) {
      this.logger.error("Error processing unmatched receipts:", error);
    }
  }

  async processNewReceipt(file: Buffer, userId: string, mimeType: string, filename: string) {
    try {
      // 1. Upload to R2
      const uploadResult = await this.r2Service.uploadFile(file, {
        userId,
        filename,
        mimeType,
        generateThumbnail: true,
      });

      const { key: r2Key, thumbnailKey: r2ThumbnailKey } = uploadResult;

      // 2. Perform OCR
      const ocrResult = await this.ocrService.processReceipt(file);

      // 3. Check for duplicates
      const potentialDuplicates = await this.findSimilarReceipts({
        userId: new Types.ObjectId(userId),
        merchant: ocrResult.structuredData.merchantName || "Unknown Merchant",
        amount: ocrResult.structuredData.total || 0,
        date: ocrResult.structuredData.date ? new Date(ocrResult.structuredData.date) : new Date(),
      });

      // If we found duplicates with high confidence, update the existing receipt
      if (potentialDuplicates.length > 0 && potentialDuplicates[0].score >= 0.9) {
        const duplicate = potentialDuplicates[0].receipt;

        // Update the existing receipt
        await this.receiptModel.findByIdAndUpdate(duplicate._id, {
          $inc: { duplicateCount: 1 },
          lastSeen: new Date(),
          $push: {
            duplicateMatches: {
              receiptId: duplicate._id,
              confidence: potentialDuplicates[0].score,
              matchedAt: new Date(),
              matchDetails: potentialDuplicates[0].matchDetails,
            },
          },
        });

        return {
          isDuplicate: true,
          existingReceipt: duplicate,
          confidence: potentialDuplicates[0].score,
          matchDetails: potentialDuplicates[0].matchDetails,
        };
      }

      // 4. Create receipt record
      const receipt = new this.receiptModel({
        userId: new Types.ObjectId(userId),
        r2Key,
        r2ThumbnailKey,
        status: "processing",
        metadata: {
          mimeType,
          size: file.length,
          processedAt: new Date(),
        },
        ocrData: ocrResult,
        merchant: ocrResult.structuredData.merchantName || "Unknown Merchant",
        amount: ocrResult.structuredData.total || 0,
        date: ocrResult.structuredData.date ? new Date(ocrResult.structuredData.date) : new Date(),
      });

      await receipt.save();

      // 5. Try to find matches
      await this.findMatchesForReceipt(receipt);

      return receipt;
    } catch (error) {
      this.logger.error("Error processing new receipt:", error);
      throw error;
    }
  }

  private async findMatchesForReceipt(receipt: ReceiptDocument) {
    try {
      // Get transactions within a date range around the receipt date
      const receiptDate = new Date(receipt.date);
      const startDate = new Date(receiptDate);
      const endDate = new Date(receiptDate);
      startDate.setDate(startDate.getDate() - 3); // Look 3 days before
      endDate.setDate(endDate.getDate() + 3); // Look 3 days after

      // TODO: Replace with your transaction model
      const transactions = await this.findTransactionsInDateRange(
        receipt.userId.toString(),
        startDate,
        endDate,
      );

      const matches: MatchResult[] = [];

      for (const transaction of transactions) {
        const confidence = this.calculateMatchConfidence(receipt, transaction);
        if (confidence.totalScore >= 0.8) {
          // 80% confidence threshold
          matches.push({
            receipt,
            transaction,
            confidence: confidence.totalScore,
            matchDetails: confidence,
          });
        }
      }

      // Sort matches by confidence
      matches.sort((a, b) => b.confidence - a.confidence);

      if (matches.length > 0) {
        const bestMatch = matches[0];
        await this.linkReceiptToTransaction(receipt, bestMatch.transaction);
      }

      // Update receipt status
      await this.receiptModel.findByIdAndUpdate(receipt._id, {
        status: matches.length > 0 ? "matched" : "unmatched",
      });

      return matches;
    } catch (error) {
      this.logger.error("Error finding matches for receipt:", error);
      throw error;
    }
  }

  private calculateMatchConfidence(
    receipt: ReceiptDocument,
    transaction: BaseTransactionData,
  ): MatchScoreDetails {
    const receiptData: ReceiptData = {
      merchantName: receipt.merchant || "Unknown",
      amount: receipt.amount,
      date: new Date(receipt.date),
    };

    const result = calculateReceiptMatchScore(receiptData, transaction);
    return {
      merchantScore: result.merchantScore,
      amountScore: result.amountScore,
      dateScore: result.dateScore,
      totalScore: result.score,
    };
  }

  private async findTransactionsInDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<BaseTransactionData[]> {
    // TODO: Implement this method based on your transaction model
    return [];
  }

  private async linkReceiptToTransaction(
    receipt: ReceiptDocument,
    transaction: BaseTransactionData,
  ): Promise<BaseTransactionData> {
    const updatedTransaction: BaseTransactionData = {
      ...transaction,
      type: "debit",
      status: "posted",
      metadata: {
        ...transaction.metadata,
        receiptId: receipt._id.toString(),
        linkedAt: new Date(),
      },
    };

    // Update receipt status
    await this.receiptModel.findByIdAndUpdate(receipt._id, {
      status: "matched",
      transactionId: transaction.id,
    });

    return updatedTransaction;
  }

  async findReceipts(query: any, options: { limit: number; offset: number }) {
    try {
      const receipts = await this.receiptModel
        .find(query)
        .sort({ date: -1 })
        .skip(options.offset)
        .limit(options.limit)
        .exec();

      // Update signed URLs for each receipt
      for (const receipt of receipts) {
        if (receipt.r2Key) {
          receipt.urls = {
            fullImageUrl: await this.r2Service.getSignedUrl(receipt.r2Key, 3600),
            thumbnailUrl: receipt.r2ThumbnailKey
              ? await this.r2Service.getSignedUrl(receipt.r2ThumbnailKey, 3600)
              : undefined,
          };
        }
      }

      return receipts;
    } catch (error) {
      this.logger.error("Error finding receipts:", error);
      throw error;
    }
  }

  async findReceiptById(id: string, userId: string) {
    try {
      const receipt = await this.receiptModel
        .findOne({
          _id: new Types.ObjectId(id),
          userId: new Types.ObjectId(userId),
        })
        .exec();

      if (!receipt) {
        throw new Error("Receipt not found");
      }

      // Update signed URLs
      if (receipt.r2Key) {
        const fullImageUrl = await this.r2Service.getSignedUrl(receipt.r2Key, 3600);
        const thumbnailUrl = receipt.r2ThumbnailKey
          ? await this.r2Service.getSignedUrl(receipt.r2ThumbnailKey, 3600)
          : undefined;

        receipt.urls = { fullImageUrl, thumbnailUrl };
      }

      return receipt;
    } catch (error) {
      this.logger.error("Error finding receipt by ID:", error);
      throw error;
    }
  }

  async deleteReceipt(id: string, userId: string) {
    try {
      const receipt = await this.receiptModel
        .findOne({
          _id: new Types.ObjectId(id),
          userId: new Types.ObjectId(userId),
        })
        .exec();

      if (!receipt) {
        throw new Error("Receipt not found");
      }

      // Delete files from R2
      if (receipt.r2Key) {
        await this.r2Service.deleteFile(receipt.r2Key);
      }
      if (receipt.r2ThumbnailKey) {
        await this.r2Service.deleteFile(receipt.r2ThumbnailKey);
      }

      // Delete receipt from database
      await this.receiptModel.findByIdAndDelete(id);
    } catch (error) {
      this.logger.error("Error deleting receipt:", error);
      throw error;
    }
  }

  async findMatchesForReceiptById(id: string, userId: string) {
    try {
      const receipt = await this.findReceiptById(id, userId);
      return this.findMatchesForReceipt(receipt);
    } catch (error) {
      this.logger.error("Error finding matches for receipt by ID:", error);
      throw error;
    }
  }

  async linkReceiptToTransactionById(receiptId: string, transactionId: string, userId: string) {
    try {
      const receipt = await this.findReceiptById(receiptId, userId);

      // Create a BaseTransactionData object with required fields
      const transaction: BaseTransactionData = {
        id: transactionId,
        accountId: userId,
        amount: 0, // You should get this from your transaction service
        date: new Date(),
        description: "",
        type: "debit",
        status: "pending",
      };

      await this.linkReceiptToTransaction(receipt, transaction);
    } catch (error) {
      this.logger.error("Error linking receipt to transaction:", error);
      throw error;
    }
  }

  async findDuplicateReceipts(receipt: ReceiptDocument): Promise<ReceiptDocument[]> {
    try {
      const similarReceipts = await this.findSimilarReceipts(receipt);
      const duplicates = similarReceipts.filter((r) => r.score >= 0.8);
      return duplicates.map((d) => d.receipt);
    } catch (error) {
      this.logger.error("Error finding duplicate receipts:", error);
      throw error;
    }
  }

  async findSimilarReceipts(receipt: ReceiptDocument): Promise<
    {
      receipt: ReceiptDocument;
      score: number;
      matchDetails: MatchScoreDetails;
    }[]
  > {
    try {
      const allReceipts = await this.receiptModel
        .find({
          userId: receipt.userId,
          _id: { $ne: receipt._id },
        })
        .exec();

      const matches = allReceipts.map((otherReceipt) => {
        const receiptData: ReceiptData = {
          merchantName: receipt.merchant || "Unknown",
          amount: receipt.amount || 0,
          date: receipt.date || new Date(),
        };

        const transactionData: BaseTransactionData = {
          id: otherReceipt._id.toString(),
          accountId: otherReceipt.userId.toString(),
          amount: otherReceipt.amount || 0,
          date: otherReceipt.date || new Date(),
          description: otherReceipt.description || "",
          type: "debit",
          status: "pending",
          merchantName: otherReceipt.merchant || "Unknown",
        };

        const result = calculateReceiptMatchScore(receiptData, transactionData);

        return {
          receipt: otherReceipt,
          score: result.score,
          matchDetails: {
            merchantScore: result.merchantScore,
            amountScore: result.amountScore,
            dateScore: result.dateScore,
            totalScore: result.score,
          },
        };
      });

      return matches.filter((match) => match.score >= 0.7).sort((a, b) => b.score - a.score);
    } catch (error) {
      this.logger.error("Error finding similar receipts:", error);
      throw error;
    }
  }

  private calculateMatchScore(
    receipt1: ReceiptDocument,
    receipt2: ReceiptDocument,
  ): {
    receipt: ReceiptDocument;
    score: number;
    matchDetails: MatchScoreDetails;
  } {
    const receiptData: ReceiptData = {
      merchantName: receipt1.merchant || "Unknown",
      amount: receipt1.amount || 0,
      date: receipt1.date || new Date(),
    };

    const transactionData: BaseTransactionData = {
      id: receipt2._id.toString(),
      accountId: receipt2.userId.toString(),
      amount: receipt2.amount || 0,
      date: receipt2.date || new Date(),
      description: receipt2.description || "",
      type: "debit",
      status: "pending",
      merchantName: receipt2.merchant || "Unknown",
    };

    const result = calculateReceiptMatchScore(receiptData, transactionData);

    return {
      receipt: receipt2,
      score: result.score,
      matchDetails: {
        merchantScore: result.merchantScore,
        amountScore: result.amountScore,
        dateScore: result.dateScore,
        totalScore: result.score,
      },
    };
  }

  private async createTransactionFromReceipt(
    receipt: ReceiptDocument,
  ): Promise<BaseTransactionData> {
    const merchantName = receipt.merchant || "Unknown Merchant";

    const transaction: BaseTransactionData = {
      id: receipt._id.toString(),
      accountId: receipt.userId.toString(),
      amount: receipt.amount,
      date: new Date(receipt.date),
      description: merchantName,
      type: "debit",
      status: "pending",
      merchantName,
    };

    return transaction;
  }
}
