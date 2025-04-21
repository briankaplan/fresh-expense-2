import type { Transaction } from "@fresh-expense/types";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";

import { TransactionSchema } from "../../schemas/transaction.schema";

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel("Transaction")
    private readonly transactionModel: Model<Transaction>,
  ) {}

  async createMany(transactions: Partial<Transaction>[]): Promise<Transaction[]> {
    return this.transactionModel.insertMany(transactions);
  }

  async findOne(id: string): Promise<Transaction | null> {
    return this.transactionModel.findById(id).exec();
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionModel.find().exec();
  }

  async update(id: string, update: Partial<Transaction>): Promise<Transaction | null> {
    return this.transactionModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async delete(id: string): Promise<Transaction | null> {
    return this.transactionModel.findByIdAndDelete(id).exec();
  }

  async findByMerchantId(merchantId: string): Promise<Transaction[]> {
    const transactions = await this.transactionModel.find({ merchant: merchantId }).lean().exec();
    return transactions.map((transaction) => ({
      ...transaction,
      _id: transaction._id.toString(),
    })) as Transaction[];
  }
}
