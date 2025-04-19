import type { ReceiptDocument } from "@fresh-expense/types";
import { Subscription, type SubscriptionDocument } from "@fresh-expense/types";
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";

interface SubscriptionDetectionResult {
  isSubscription: boolean;
  frequency?: "monthly" | "annual" | "weekly";
  startDate?: Date;
  amount?: number;
  cancellationDate?: Date;
}

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  private readonly subscriptionKeywords = [
    "subscription",
    "monthly",
    "annual",
    "yearly",
    "recurring",
    "auto-renew",
    "membership",
  ];
  private readonly cancellationKeywords = [
    "cancel",
    "unsubscribe",
    "terminate",
    "end subscription",
  ];

  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async checkForSubscriptions(receipt: ReceiptDocument): Promise<void> {
    try {
      const detectionResult = await this.detectSubscription(receipt);

      if (detectionResult.isSubscription) {
        await this.createOrUpdateSubscription(receipt, detectionResult);
      } else if (detectionResult.cancellationDate) {
        await this.cancelSubscription(receipt.merchant, detectionResult.cancellationDate);
      }
    } catch (error) {
      this.logger.error("Error checking for subscriptions:", error);
      throw error;
    }
  }

  private async detectSubscription(receipt: ReceiptDocument): Promise<SubscriptionDetectionResult> {
    const text = receipt.metadata?.ocrText?.toLowerCase() || "";

    // Check for cancellation first
    if (this.cancellationKeywords.some((keyword) => text.includes(keyword))) {
      return {
        isSubscription: false,
        cancellationDate: receipt.date,
      };
    }

    // Check for subscription indicators
    const hasSubscriptionKeywords = this.subscriptionKeywords.some((keyword) =>
      text.includes(keyword),
    );

    if (!hasSubscriptionKeywords) {
      return { isSubscription: false };
    }

    // Extract subscription details
    const frequency = this.detectFrequency(text);
    const amount = this.extractAmount(text);
    const startDate = this.extractStartDate(text);

    return {
      isSubscription: true,
      frequency,
      amount,
      startDate: startDate || receipt.date,
    };
  }

  private async createOrUpdateSubscription(
    receipt: ReceiptDocument,
    detectionResult: SubscriptionDetectionResult,
  ): Promise<void> {
    const existingSubscription = await this.subscriptionModel.findOne({
      merchant: receipt.merchant,
      userId: receipt.userId,
    });

    if (existingSubscription) {
      await this.updateSubscription(existingSubscription, detectionResult);
    } else {
      await this.createSubscription(receipt, detectionResult);
    }
  }

  private async createSubscription(
    receipt: ReceiptDocument,
    detectionResult: SubscriptionDetectionResult,
  ): Promise<void> {
    const subscription = new this.subscriptionModel({
      userId: receipt.userId,
      merchant: receipt.merchant,
      amount: detectionResult.amount || receipt.amount,
      frequency: detectionResult.frequency || "monthly",
      startDate: detectionResult.startDate,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await subscription.save();
  }

  private async updateSubscription(
    subscription: SubscriptionDocument,
    detectionResult: SubscriptionDetectionResult,
  ): Promise<void> {
    await subscription.updateOne({
      $set: {
        amount: detectionResult.amount || subscription.amount,
        frequency: detectionResult.frequency || subscription.frequency,
        updatedAt: new Date(),
      },
    });
  }

  private async cancelSubscription(merchant: string, cancellationDate: Date): Promise<void> {
    await this.subscriptionModel.updateOne(
      { merchant },
      {
        $set: {
          status: "cancelled",
          cancellationDate,
          updatedAt: new Date(),
        },
      },
    );
  }

  private detectFrequency(text: string): SubscriptionDetectionResult["frequency"] {
    if (text.includes("annual") || text.includes("yearly")) {
      return "annual";
    } else if (text.includes("weekly")) {
      return "weekly";
    }
    return "monthly"; // Default to monthly
  }

  private extractAmount(text: string): number | undefined {
    // TODO: Implement amount extraction from text
    return undefined;
  }

  private extractStartDate(text: string): Date | undefined {
    // TODO: Implement start date extraction from text
    return undefined;
  }
}
