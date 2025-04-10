import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Receipt, ReceiptDocument } from '@schemas/receipt.schema';
import { R2Service } from '../r2/r2.service';
import { OCRService } from '../ocr/ocr.service';
import { Cron, CronExpression } from '@nestjs/schedule';

interface MatchResult {
  receipt: ReceiptDocument;
  transaction: any; // Replace with your Transaction type
  confidence: number;
  matchDetails: {
    amountMatch: number;
    dateMatch: number;
    merchantMatch: number;
    totalConfidence: number;
  };
}

@Injectable()
export class ReceiptBankService {
  private readonly logger = new Logger(ReceiptBankService.name);

  constructor(
    @InjectModel(Receipt.name) private receiptModel: Model<ReceiptDocument>,
    private readonly r2Service: R2Service,
    private readonly ocrService: OCRService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async processUnmatchedReceipts() {
    try {
      const unmatchedReceipts = await this.receiptModel
        .find({ status: 'unmatched' })
        .exec();

      this.logger.log(`Processing ${unmatchedReceipts.length} unmatched receipts`);

      for (const receipt of unmatchedReceipts) {
        await this.findMatchesForReceipt(receipt);
      }
    } catch (error) {
      this.logger.error('Error processing unmatched receipts:', error);
    }
  }

  async processNewReceipt(file: Buffer, userId: string, mimeType: string, filename: string) {
    try {
      // 1. Upload to R2
      const { key: r2Key, thumbnailKey: r2ThumbnailKey } = await this.r2Service.uploadReceipt(
        file,
        mimeType,
        filename
      );

      // 2. Perform OCR
      const ocrResult = await this.ocrService.processReceipt(file);

      // 3. Create receipt record
      const receipt = new this.receiptModel({
        userId: new Types.ObjectId(userId),
        r2Key,
        r2ThumbnailKey,
        status: 'processing',
        metadata: {
          mimeType,
          size: file.length,
          processedAt: new Date(),
        },
        ocrData: ocrResult,
        merchant: ocrResult.merchant || 'Unknown Merchant',
        amount: ocrResult.totalAmount || 0,
        date: ocrResult.date || new Date(),
      });

      await receipt.save();

      // 4. Try to find matches
      await this.findMatchesForReceipt(receipt);

      return receipt;
    } catch (error) {
      this.logger.error('Error processing new receipt:', error);
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
        if (confidence.totalConfidence >= 0.8) { // 80% confidence threshold
          matches.push({
            receipt,
            transaction,
            confidence: confidence.totalConfidence,
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
        status: matches.length > 0 ? 'matched' : 'unmatched'
      });

      return matches;
    } catch (error) {
      this.logger.error('Error finding matches for receipt:', error);
      throw error;
    }
  }

  private calculateMatchConfidence(receipt: ReceiptDocument, transaction: any) {
    // Amount match (weighted 40%)
    const amountDiff = Math.abs(receipt.amount - transaction.amount);
    const amountMatch = amountDiff === 0 ? 1 :
      amountDiff <= 0.01 ? 0.9 :
      amountDiff <= 0.1 ? 0.8 :
      amountDiff <= 1 ? 0.6 : 0;

    // Date match (weighted 30%)
    const daysDiff = Math.abs(
      (new Date(receipt.date).getTime() - new Date(transaction.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    const dateMatch = daysDiff === 0 ? 1 :
      daysDiff <= 1 ? 0.9 :
      daysDiff <= 2 ? 0.7 :
      daysDiff <= 3 ? 0.5 : 0;

    // Merchant match (weighted 30%)
    const merchantMatch = this.calculateMerchantSimilarity(
      receipt.merchant,
      transaction.merchant
    );

    // Calculate total confidence
    const totalConfidence = (
      amountMatch * 0.4 +
      dateMatch * 0.3 +
      merchantMatch * 0.3
    );

    return {
      amountMatch,
      dateMatch,
      merchantMatch,
      totalConfidence,
    };
  }

  private calculateMerchantSimilarity(merchant1: string, merchant2: string): number {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const m1 = normalize(merchant1);
    const m2 = normalize(merchant2);

    if (m1 === m2) return 1;
    if (m1.includes(m2) || m2.includes(m1)) return 0.9;

    // Levenshtein distance for fuzzy matching
    const distance = this.levenshteinDistance(m1, m2);
    const maxLength = Math.max(m1.length, m2.length);
    return 1 - (distance / maxLength);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str1.length + 1).fill(null).map(() =>
      Array(str2.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= str2.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[str1.length][str2.length];
  }

  private async findTransactionsInDateRange(userId: string, startDate: Date, endDate: Date) {
    // TODO: Implement this method based on your transaction model
    return [];
  }

  private async linkReceiptToTransaction(receipt: ReceiptDocument, transaction: any) {
    // TODO: Implement this method based on your transaction model
    // Update both the receipt and transaction with the link
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
        receipt.fullImageUrl = await this.r2Service.getSignedUrl(receipt.r2Key);
        receipt.thumbnailUrl = await this.r2Service.getSignedUrl(receipt.r2ThumbnailKey);
      }

      return receipts;
    } catch (error) {
      this.logger.error('Error finding receipts:', error);
      throw error;
    }
  }

  async findReceiptById(id: string, userId: string) {
    try {
      const receipt = await this.receiptModel
        .findOne({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) })
        .exec();

      if (!receipt) {
        throw new Error('Receipt not found');
      }

      // Update signed URLs
      receipt.fullImageUrl = await this.r2Service.getSignedUrl(receipt.r2Key);
      receipt.thumbnailUrl = await this.r2Service.getSignedUrl(receipt.r2ThumbnailKey);

      return receipt;
    } catch (error) {
      this.logger.error('Error finding receipt by ID:', error);
      throw error;
    }
  }

  async deleteReceipt(id: string, userId: string) {
    try {
      const receipt = await this.receiptModel
        .findOne({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) })
        .exec();

      if (!receipt) {
        throw new Error('Receipt not found');
      }

      // Delete files from R2
      await this.r2Service.deleteFile(receipt.r2Key);
      await this.r2Service.deleteFile(receipt.r2ThumbnailKey);

      // Delete receipt from database
      await this.receiptModel.findByIdAndDelete(id);
    } catch (error) {
      this.logger.error('Error deleting receipt:', error);
      throw error;
    }
  }

  async findMatchesForReceiptById(id: string, userId: string) {
    try {
      const receipt = await this.findReceiptById(id, userId);
      return this.findMatchesForReceipt(receipt);
    } catch (error) {
      this.logger.error('Error finding matches for receipt by ID:', error);
      throw error;
    }
  }

  async linkReceiptToTransactionById(
    receiptId: string,
    transactionId: string,
    userId: string
  ) {
    try {
      const receipt = await this.findReceiptById(receiptId, userId);
      
      // TODO: Implement transaction model and validation
      const transaction = { id: transactionId }; // Placeholder
      
      await this.linkReceiptToTransaction(receipt, transaction);
    } catch (error) {
      this.logger.error('Error linking receipt to transaction:', error);
      throw error;
    }
  }
} 