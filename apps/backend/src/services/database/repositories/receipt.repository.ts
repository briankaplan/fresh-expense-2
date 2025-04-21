import { Filter, FindOptions } from "mongodb";

import { BaseRepository } from "./base.repository";
import type { MongoDBService } from "../mongodb.service";
import { RECEIPT_COLLECTION, type ReceiptSchema } from "../schemas/receipt.schema";

export class ReceiptRepository extends BaseRepository<ReceiptSchema> {
  protected readonly collectionName = RECEIPT_COLLECTION;

  async findByUserId(userId: string): Promise<ReceiptSchema[]> {
    return this.find({ userId });
  }

  async findByMerchantId(merchantId: string): Promise<ReceiptSchema[]> {
    return this.find({ merchantId });
  }

  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<ReceiptSchema[]> {
    return this.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });
  }

  async updateProcessingStatus(
    receiptId: string,
    status: ReceiptSchema["processingStatus"],
    errorMessage?: string,
  ): Promise<boolean> {
    return this.update(
      { _id: receiptId },
      {
        $set: {
          processingStatus: status,
          isProcessed: status === "completed",
          errorMessage: status === "failed" ? errorMessage : undefined,
        },
      },
    );
  }

  async updateOCRData(receiptId: string, ocrData: ReceiptSchema["ocrData"]): Promise<boolean> {
    return this.update(
      { _id: receiptId },
      {
        $set: {
          ocrData,
        },
      },
    );
  }

  async getTotalSpentByUser(userId: string): Promise<number> {
    const receipts = await this.find({ userId });
    return receipts.reduce((total, receipt) => total + receipt.totalAmount, 0);
  }

  async getReceiptsByCategory(userId: string, category: string): Promise<ReceiptSchema[]> {
    return this.find({
      userId,
      "items.category": category,
    });
  }
}
