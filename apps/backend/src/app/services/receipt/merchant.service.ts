import type { ReceiptDocument , Merchant, type MerchantDocument } from "@fresh-expense/types";
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";

interface MerchantStats {
  receiptCount: number;
  totalSpent: number;
  averageAmount: number;
  lastSeen: Date;
  subscriptionInfo?: {
    isSubscription: boolean;
    frequency?: "monthly" | "annual" | "weekly";
    startDate?: Date;
    amount?: number;
  };
}

@Injectable()
export class MerchantService {
  private readonly logger = new Logger(MerchantService.name);

  constructor(
    @InjectModel(Merchant.name)
    private readonly merchantModel: Model<MerchantDocument>,
  ) {}

  async updateMerchantFromReceipt(receipt: ReceiptDocument): Promise<void> {
    try {
      const merchant = await this.merchantModel.findOne({
        name: receipt.merchant,
      });

      if (merchant) {
        // Update existing merchant
        await this.updateExistingMerchant(merchant, receipt);
      } else {
        // Create new merchant
        await this.createNewMerchant(receipt);
      }
    } catch (error) {
      this.logger.error("Error updating merchant from receipt:", error);
      throw error;
    }
  }

  private async updateExistingMerchant(
    merchant: MerchantDocument,
    receipt: ReceiptDocument,
  ): Promise<void> {
    const stats = await this.calculateMerchantStats(merchant, receipt);

    await merchant.updateOne({
      $inc: { receiptCount: 1 },
      $set: {
        totalSpent: stats.totalSpent,
        averageAmount: stats.averageAmount,
        lastSeen: stats.lastSeen,
        subscriptionInfo: stats.subscriptionInfo,
      },
    });
  }

  private async createNewMerchant(receipt: ReceiptDocument): Promise<void> {
    const newMerchant = new this.merchantModel({
      name: receipt.merchant,
      receiptCount: 1,
      totalSpent: receipt.amount,
      averageAmount: receipt.amount,
      lastSeen: receipt.date,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newMerchant.save();
  }

  private async calculateMerchantStats(
    merchant: MerchantDocument,
    receipt: ReceiptDocument,
  ): Promise<MerchantStats> {
    const receiptCount = merchant.receiptCount + 1;
    const totalSpent = merchant.totalSpent + receipt.amount;
    const averageAmount = totalSpent / receiptCount;

    return {
      receiptCount,
      totalSpent,
      averageAmount,
      lastSeen: receipt.date,
      subscriptionInfo: await this.checkForSubscription(merchant, receipt),
    };
  }

  private async checkForSubscription(
    merchant: MerchantDocument,
    receipt: ReceiptDocument,
  ): Promise<MerchantStats["subscriptionInfo"]> {
    // TODO: Implement subscription detection
    // This should:
    // 1. Check receipt text for subscription keywords
    // 2. Analyze transaction patterns
    // 3. Return subscription info if found
    return undefined;
  }

  async getMerchantStats(merchantName: string): Promise<MerchantStats> {
    try {
      const merchant = await this.merchantModel.findOne({ name: merchantName });
      if (!merchant) {
        throw new Error("Merchant not found");
      }

      return {
        receiptCount: merchant.receiptCount,
        totalSpent: merchant.totalSpent,
        averageAmount: merchant.averageAmount,
        lastSeen: merchant.lastSeen,
        subscriptionInfo: merchant.subscriptionInfo,
      };
    } catch (error) {
      this.logger.error("Error getting merchant stats:", error);
      throw error;
    }
  }
}
