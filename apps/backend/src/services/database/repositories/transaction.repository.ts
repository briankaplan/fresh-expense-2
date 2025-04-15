import { Filter, FindOptions } from 'mongodb';
import { MongoDBService } from '../mongodb.service';
import { BaseRepository } from './base.repository';
import { TransactionSchema, TRANSACTION_COLLECTION } from '../schemas/transaction.schema';

export class TransactionRepository extends BaseRepository<TransactionSchema> {
  protected readonly collectionName = TRANSACTION_COLLECTION;

  constructor(mongoDBService: MongoDBService) {
    super(mongoDBService);
  }

  async findByUserId(userId: string): Promise<TransactionSchema[]> {
    return this.find({ userId });
  }

  async findByMerchantId(merchantId: string): Promise<TransactionSchema[]> {
    return this.find({ merchantId });
  }

  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TransactionSchema[]> {
    return this.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });
  }

  async findByCategory(userId: string, category: string): Promise<TransactionSchema[]> {
    return this.find({ userId, category });
  }

  async findByType(userId: string, type: TransactionSchema['type']): Promise<TransactionSchema[]> {
    return this.find({ userId, type });
  }

  async findByStatus(
    userId: string,
    status: TransactionSchema['status']
  ): Promise<TransactionSchema[]> {
    return this.find({ userId, status });
  }

  async getTotalByType(userId: string, type: TransactionSchema['type']): Promise<number> {
    const transactions = await this.find({ userId, type });
    return transactions.reduce((total, transaction) => total + transaction.amount, 0);
  }

  async getRecurringTransactions(userId: string): Promise<TransactionSchema[]> {
    return this.find({ userId, isRecurring: true });
  }

  async updateTransactionStatus(
    transactionId: string,
    status: TransactionSchema['status']
  ): Promise<boolean> {
    return this.update(
      { _id: transactionId },
      {
        $set: { status },
      }
    );
  }

  async addTag(transactionId: string, tag: string): Promise<boolean> {
    return this.update(
      { _id: transactionId },
      {
        $addToSet: { tags: tag },
      }
    );
  }

  async removeTag(transactionId: string, tag: string): Promise<boolean> {
    return this.update(
      { _id: transactionId },
      {
        $pull: { tags: tag },
      }
    );
  }
}
