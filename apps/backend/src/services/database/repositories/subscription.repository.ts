import { Filter, FindOptions } from "mongodb";
import type { MongoDBService } from "../mongodb.service";
import { SUBSCRIPTION_COLLECTION, type SubscriptionSchema } from "../schemas/subscription.schema";
import { BaseRepository } from "./base.repository";

export class SubscriptionRepository extends BaseRepository<SubscriptionSchema> {
  protected readonly collectionName = SUBSCRIPTION_COLLECTION;

  constructor(mongoDBService: MongoDBService) {
    super(mongoDBService);
  }

  async findByUserId(userId: string): Promise<SubscriptionSchema[]> {
    return this.find({ userId });
  }

  async findByMerchantId(merchantId: string): Promise<SubscriptionSchema[]> {
    return this.find({ merchantId });
  }

  async findByStatus(
    userId: string,
    status: SubscriptionSchema["status"],
  ): Promise<SubscriptionSchema[]> {
    return this.find({ userId, status });
  }

  async getActiveSubscriptions(userId: string): Promise<SubscriptionSchema[]> {
    return this.find({ userId, status: "matched" });
  }

  async getUpcomingBillingSubscriptions(
    userId: string,
    daysAhead: number,
  ): Promise<SubscriptionSchema[]> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);

    return this.find({
      userId,
      status: "matched",
      nextBillingDate: {
        $lte: targetDate,
      },
    });
  }

  async updateSubscriptionStatus(
    subscriptionId: string,
    status: SubscriptionSchema["status"],
  ): Promise<boolean> {
    return this.update(
      { _id: subscriptionId },
      {
        $set: { status },
      },
    );
  }

  async updateNextBillingDate(subscriptionId: string, nextBillingDate: Date): Promise<boolean> {
    return this.update(
      { _id: subscriptionId },
      {
        $set: { nextBillingDate },
      },
    );
  }

  async getTotalMonthlySpend(userId: string): Promise<number> {
    const subscriptions = await this.find({
      userId,
      status: "matched",
      frequency: "monthly",
    });
    return subscriptions.reduce((total, sub) => total + sub.amount, 0);
  }

  async addTag(subscriptionId: string, tag: string): Promise<boolean> {
    return this.update(
      { _id: subscriptionId },
      {
        $addToSet: { tags: tag },
      },
    );
  }

  async removeTag(subscriptionId: string, tag: string): Promise<boolean> {
    return this.update(
      { _id: subscriptionId },
      {
        $pull: { tags: tag },
      },
    );
  }
}
