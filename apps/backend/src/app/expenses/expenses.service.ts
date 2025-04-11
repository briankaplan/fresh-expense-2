import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const createdExpense = new this.expenseModel(createExpenseDto);
    return createdExpense.save();
  }

  async findAll(query: any = {}): Promise<Expense[]> {
    return this.expenseModel.find(query).exec();
  }

  async findOne(id: string): Promise<Expense> {
    return this.expenseModel.findById(id).exec();
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    return this.expenseModel
      .findByIdAndUpdate(id, updateExpenseDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Expense> {
    return this.expenseModel.findByIdAndDelete(id).exec();
  }

  async findByUserId(userId: string, query: any = {}): Promise<Expense[]> {
    return this.expenseModel.find({ userId, ...query }).exec();
  }

  async findByCompanyId(companyId: string, query: any = {}): Promise<Expense[]> {
    return this.expenseModel.find({ companyId, ...query }).exec();
  }

  async getExpenseSummary(userId: string, startDate: Date, endDate: Date) {
    return this.expenseModel.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          byCategory: {
            $push: {
              categoryId: '$categoryId',
              amount: '$amount'
            }
          },
          byMerchant: {
            $push: {
              merchantId: '$merchantId',
              amount: '$amount'
            }
          }
        }
      }
    ]).exec();
  }
} 