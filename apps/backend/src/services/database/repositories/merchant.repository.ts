import { Filter, FindOptions } from "mongodb";
import type { MongoDBService } from "../mongodb.service";
import { MERCHANT_COLLECTION, type MerchantSchema } from "../schemas/merchant.schema";
import { BaseRepository } from "./base.repository";

export class MerchantRepository extends BaseRepository<MerchantSchema> {
  protected readonly collectionName = MERCHANT_COLLECTION;

  async findByName(name: string): Promise<MerchantSchema | null> {
    return this.findOne({ name });
  }

  async findByCategory(category: string): Promise<MerchantSchema[]> {
    return this.find({ category });
  }

  async findActiveMerchants(): Promise<MerchantSchema[]> {
    return this.find({ isActive: true });
  }

  async updateTransactionStats(merchantId: string, amount: number): Promise<boolean> {
    const merchant = await this.findOne({ _id: merchantId });
    if (!merchant) return false;

    const newTransactionCount = merchant.transactionCount + 1;
    const newAverageAmount = merchant.averageTransactionAmount
      ? (merchant.averageTransactionAmount * merchant.transactionCount + amount) /
        newTransactionCount
      : amount;

    return this.update(
      { _id: merchantId },
      {
        $set: {
          lastTransactionDate: new Date(),
          transactionCount: newTransactionCount,
          averageTransactionAmount: newAverageAmount,
        },
      },
    );
  }

  async searchMerchants(query: string): Promise<MerchantSchema[]> {
    return this.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    });
  }
}
