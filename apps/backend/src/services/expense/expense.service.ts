import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery, FilterQuery, UpdateWriteOpResult } from 'mongoose';
import { Expense } from './expense.schema';

interface ExpenseQueryOptions {
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  tags?: string[];
  status?: string[];
}

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name);

  constructor(
    @InjectModel(Expense.name)
    private expenseModel: Model<Expense>,
  ) {}

  async findByUserId(userId: string, options: ExpenseQueryOptions = {}): Promise<Expense[]> {
    try {
      const query: FilterQuery<Expense> = { userId: new Types.ObjectId(userId) };

      if (options.startDate) {
        query.date = { $gte: options.startDate };
      }

      if (options.endDate) {
        query.date = { ...query.date, $lte: options.endDate };
      }

      if (options.categories?.length) {
        query.category = { $in: options.categories };
      }

      if (options.tags?.length) {
        query.tags = { $in: options.tags };
      }

      if (options.status?.length) {
        query.status = { $in: options.status };
      }

      return this.expenseModel.find(query).sort({ date: -1 }).exec();
    } catch (error) {
      this.logger.error('Error finding expenses:', error);
      throw error;
    }
  }

  async findOne(query: FilterQuery<Expense>): Promise<Expense | null> {
    try {
      return this.expenseModel.findOne(query).exec();
    } catch (error) {
      this.logger.error('Error finding expense:', error);
      throw error;
    }
  }

  async updateOne(
    query: FilterQuery<Expense>,
    update: UpdateQuery<Expense>
  ): Promise<UpdateWriteOpResult> {
    try {
      return this.expenseModel.updateOne(query, update).exec();
    } catch (error) {
      this.logger.error('Error updating expense:', error);
      throw error;
    }
  }

  async updateMany(
    query: FilterQuery<Expense>,
    update: UpdateQuery<Expense>
  ): Promise<UpdateWriteOpResult> {
    try {
      return this.expenseModel.updateMany(query, update).exec();
    } catch (error) {
      this.logger.error('Error updating expenses:', error);
      throw error;
    }
  }
} 