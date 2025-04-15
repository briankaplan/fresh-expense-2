import { Filter, FindOptions } from 'mongodb';
import { MongoDBService } from '../mongodb.service';
import { BaseRepository } from './base.repository';
import { MerchantSchema, MERCHANT_COLLECTION } from '../schemas/merchant.schema';

export class MerchantRepository extends BaseRepository<MerchantSchema> {
  protected readonly collectionName = MERCHANT_COLLECTION;

  constructor(mongoDBService: MongoDBService) {
    super(mongoDBService);
  }

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
      }
    );
  }

  async searchMerchants(query: string): Promise<MerchantSchema[]> {
    return this.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    });
  }
}
