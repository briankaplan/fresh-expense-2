import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Receipt, ReceiptDocument, BaseTransactionData } from '@fresh-expense/types';
import { R2Service } from '../../../services/r2/r2.service';
import { OCRService } from '../../../services/ocr/ocr.service';

interface MatchResult {
  receipt: ReceiptDocument;
  transaction: BaseTransactionData;
  confidence: number;
  matchDetails: {
    merchantScore: number;
    amountScore: number;
    dateScore: number;
    totalScore: number;
  };
}

@Injectable()
export class ReceiptBankService {
  private readonly logger = new Logger(ReceiptBankService.name);

  constructor(
    @InjectModel('Receipt') private receiptModel: Model<ReceiptDocument>,
    private readonly r2Service: R2Service,
    private readonly ocrService: OCRService
  ) {}

  async storeReceipt(receipt: ReceiptDocument): Promise<void> {
    await this.receiptModel.create(receipt);
  }

  async getUnmatchedReceipts(): Promise<ReceiptDocument[]> {
    return this.receiptModel.find({ status: 'unmatched' }).exec();
  }

  async findReceiptById(id: string, userId: string): Promise<ReceiptDocument> {
    const receipt = await this.receiptModel
      .findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!receipt) {
      throw new Error('Receipt not found');
    }

    return receipt;
  }

  async deleteReceipt(id: string, userId: string): Promise<void> {
    const receipt = await this.findReceiptById(id, userId);

    // Delete from R2
    if (receipt.r2Key) {
      await this.r2Service.deleteFile(receipt.r2Key);
    }
    if (receipt.r2ThumbnailKey) {
      await this.r2Service.deleteFile(receipt.r2ThumbnailKey);
    }

    // Delete from database
    await this.receiptModel.findByIdAndDelete(id);
  }

  async findMatchesForReceipt(receipt: ReceiptDocument): Promise<MatchResult[]> {
    // Get transactions within a date range around the receipt date
    const receiptDate = new Date(receipt.date);
    const startDate = new Date(receiptDate);
    const endDate = new Date(receiptDate);
    startDate.setDate(startDate.getDate() - 3); // Look 3 days before
    endDate.setDate(endDate.getDate() + 3); // Look 3 days after

    const transactions = await this.findTransactionsInDateRange(
      receipt.userId.toString(),
      startDate,
      endDate
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

    return matches;
  }

  async findMatchesForReceiptById(id: string, userId: string): Promise<MatchResult[]> {
    const receipt = await this.findReceiptById(id, userId);
    return this.findMatchesForReceipt(receipt);
  }

  async linkReceiptToTransaction(
    receipt: ReceiptDocument,
    transaction: BaseTransactionData
  ): Promise<void> {
    await this.receiptModel.findByIdAndUpdate(receipt._id, {
      status: 'matched',
      transactionId: new Types.ObjectId(transaction.id),
    });
  }

  async linkReceiptToTransactionById(
    receiptId: string,
    transactionId: string,
    userId: string
  ): Promise<void> {
    const receipt = await this.findReceiptById(receiptId, userId);
    await this.receiptModel.findByIdAndUpdate(receipt._id, {
      status: 'matched',
      transactionId: new Types.ObjectId(transactionId),
    });
  }

  async findSimilarReceipts(receipt: ReceiptDocument): Promise<
    {
      receipt: ReceiptDocument;
      score: number;
      matchDetails: {
        merchantScore: number;
        amountScore: number;
        dateScore: number;
        totalScore: number;
      };
    }[]
  > {
    const allReceipts = await this.receiptModel
      .find({
        userId: receipt.userId,
        _id: { $ne: receipt._id },
      })
      .exec();

    const matches = allReceipts.map(otherReceipt => {
      const transactionData: BaseTransactionData = {
        id: otherReceipt._id.toString(),
        accountId: otherReceipt.userId.toString(),
        amount: otherReceipt.amount,
        date: otherReceipt.date,
        description: otherReceipt.merchant,
        merchantName: otherReceipt.merchant,
        type: 'receipt',
        status: 'unmatched',
      };

      const confidence = this.calculateMatchConfidence(receipt, transactionData);

      return {
        receipt: otherReceipt,
        score: confidence.totalScore,
        matchDetails: confidence,
      };
    });

    return matches.filter(match => match.score >= 0.7).sort((a, b) => b.score - a.score);
  }

  private calculateMatchConfidence(
    receipt: ReceiptDocument,
    transaction: BaseTransactionData
  ): {
    merchantScore: number;
    amountScore: number;
    dateScore: number;
    totalScore: number;
  } {
    // Simple matching algorithm - can be enhanced with more sophisticated logic
    const merchantScore =
      receipt.merchant.toLowerCase() === (transaction.merchantName || '').toLowerCase() ? 1 : 0;
    const amountScore = Math.abs(receipt.amount - transaction.amount) < 0.01 ? 1 : 0;
    const dateScore =
      Math.abs(receipt.date.getTime() - transaction.date.getTime()) < 24 * 60 * 60 * 1000 ? 1 : 0;

    const totalScore = merchantScore * 0.4 + amountScore * 0.4 + dateScore * 0.2;

    return {
      merchantScore,
      amountScore,
      dateScore,
      totalScore,
    };
  }

  private async findTransactionsInDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BaseTransactionData[]> {
    // TODO: Implement this method based on your transaction model
    return [];
  }
}
