import { Receipt, type ReceiptDocument } from "@fresh-expense/types";
import { Injectable, Logger } from "@nestjs/common";
import type { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";
import type { OCRService } from "../../../services/ocr/ocr.service";
import type { R2Service } from "../../../services/r2/r2.service";
import type { MerchantLearningService } from "../merchant/merchant-learning.service";
import type { UnifiedReceiptProcessorService } from "../unified-receipt-processor.service";
import type { ReceiptBankService } from "./receipt-bank.service";

export type ReceiptSource = "EMAIL" | "GOOGLE_PHOTOS" | "UPLOAD" | "CSV" | "MANUAL";

interface ProcessReceiptOptions {
  source: ReceiptSource;
  userId: string;
  file?: {
    buffer: Buffer;
    filename: string;
    mimeType: string;
  };
  expenseData?: {
    merchant: string;
    amount: number;
    date: Date;
    transactionId?: string;
    category?: string;
  };
}

@Injectable()
export class UnifiedReceiptService {
  private readonly logger = new Logger(UnifiedReceiptService.name);

  constructor(
    @InjectModel("Receipt") private receiptModel: Model<ReceiptDocument>,
    private readonly r2Service: R2Service,
    private readonly ocrService: OCRService,
    private readonly receiptBank: ReceiptBankService,
    private readonly unifiedProcessor: UnifiedReceiptProcessorService,
    private readonly merchantLearning: MerchantLearningService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async processReceipt(options: ProcessReceiptOptions): Promise<ReceiptDocument> {
    try {
      // 1. Process the receipt based on source
      const processedReceipt = await this.unifiedProcessor.processReceipt({
        source: options.source,
        userId: options.userId,
        file: options.file,
        expenseData: options.expenseData,
      });

      // 2. Check for duplicates
      const duplicates = await this.receiptBank.findSimilarReceipts(processedReceipt);
      if (duplicates.length > 0 && duplicates[0].score >= 0.9) {
        // Update existing receipt
        const duplicate = duplicates[0].receipt;
        await this.receiptModel.findByIdAndUpdate(duplicate._id, {
          $inc: { duplicateCount: 1 },
          lastSeen: new Date(),
          $push: {
            duplicateMatches: {
              receiptId: processedReceipt._id,
              confidence: duplicates[0].score,
              matchedAt: new Date(),
              matchDetails: duplicates[0].matchDetails,
            },
          },
        });

        this.eventEmitter.emit("receipt.duplicate", {
          originalReceipt: duplicate,
          duplicateReceipt: processedReceipt,
          confidence: duplicates[0].score,
        });

        return duplicate;
      }

      // 3. Store in receipt bank for matching
      await this.receiptBank.storeReceipt(processedReceipt);

      // 4. Update merchant learning
      if (processedReceipt.merchant) {
        await this.merchantLearning.learnFromReceipt({
          merchantName: processedReceipt.merchant,
          amount: processedReceipt.amount,
          date: processedReceipt.date,
          items: processedReceipt.items,
          category: processedReceipt.category,
          confidence: processedReceipt.metadata?.ocrConfidence || 0,
        });
      }

      // 5. Try to find matches
      const matches = await this.receiptBank.findMatchesForReceipt(processedReceipt);
      if (matches.length > 0) {
        const bestMatch = matches[0];
        await this.receiptBank.linkReceiptToTransaction(processedReceipt, bestMatch.transaction);

        this.eventEmitter.emit("receipt.matched", {
          receipt: processedReceipt,
          transaction: bestMatch.transaction,
          confidence: bestMatch.confidence,
        });
      }

      return processedReceipt;
    } catch (error) {
      this.logger.error("Error processing receipt:", error);
      throw error;
    }
  }

  async findUnmatchedReceipts(userId: string): Promise<ReceiptDocument[]> {
    return this.receiptBank.getUnmatchedReceipts();
  }

  async findReceiptById(id: string, userId: string): Promise<ReceiptDocument> {
    return this.receiptBank.findReceiptById(id, userId);
  }

  async deleteReceipt(id: string, userId: string): Promise<void> {
    await this.receiptBank.deleteReceipt(id, userId);
  }

  async findMatchesForReceiptById(id: string, userId: string) {
    return this.receiptBank.findMatchesForReceiptById(id, userId);
  }

  async linkReceiptToTransactionById(receiptId: string, transactionId: string, userId: string) {
    await this.receiptBank.linkReceiptToTransactionById(receiptId, transactionId, userId);
  }
}
