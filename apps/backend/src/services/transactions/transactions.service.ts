import { Injectable } from '@nestjs/common';
import { MongoDBService } from '@/core/database/mongodb.service';
import {
  TransactionSchema,
  TRANSACTION_COLLECTION,
} from '@/core/database/schemas/transaction.schema';

@Injectable()
export class TransactionsService {
  constructor(private readonly mongoDBService: MongoDBService) {}

  async createTransaction(
    transaction: Omit<TransactionSchema, keyof BaseSchema>
  ): Promise<TransactionSchema> {
    const collection =
      await this.mongoDBService.getCollection<TransactionSchema>(TRANSACTION_COLLECTION);
    const now = new Date();
    const _id = new ObjectId();

    const newTransaction: TransactionSchema = {
      _id: _id.toString(),
      ...transaction,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(newTransaction);

    return newTransaction;
  }

  async getTransactions(userId: string): Promise<TransactionSchema[]> {
    const collection =
      await this.mongoDBService.getCollection<TransactionSchema>(TRANSACTION_COLLECTION);
    return collection.find({ userId }).toArray();
  }

  async getTransactionById(id: string): Promise<TransactionSchema | null> {
    const collection =
      await this.mongoDBService.getCollection<TransactionSchema>(TRANSACTION_COLLECTION);
    return collection.findOne({ _id: id });
  }

  async updateTransaction(id: string, update: Partial<TransactionSchema>): Promise<boolean> {
    const collection =
      await this.mongoDBService.getCollection<TransactionSchema>(TRANSACTION_COLLECTION);
    const result = await collection.updateOne(
      { _id: id },
      { $set: { ...update, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const collection =
      await this.mongoDBService.getCollection<TransactionSchema>(TRANSACTION_COLLECTION);
    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}
