import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from './schemas/transaction.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
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
} 