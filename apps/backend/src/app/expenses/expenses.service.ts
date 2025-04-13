import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(
    @InjectModel(Expense.name) private readonly expenseModel: Model<ExpenseDocument>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const createdExpense = new this.expenseModel(createExpenseDto);
    return createdExpense.save();
  }

  async findAll(query: any = {}): Promise<Expense[]> {
    try {
      return await this.expenseModel.find(query).exec();
    } catch (error) {
      this.logger.error('Error finding expenses:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Expense> {
    try {
      const expense = await this.expenseModel.findById(id).exec();
      if (!expense) {
        throw new NotFoundException(`Expense with ID ${id} not found`);
      }
      return expense;
    } catch (error) {
      this.logger.error(`Error finding expense with ID ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    try {
      const expense = await this.expenseModel.findByIdAndUpdate(id, updateExpenseDto, { new: true }).exec();
      if (!expense) {
        throw new NotFoundException(`Expense with ID ${id} not found`);
      }
      return expense;
    } catch (error) {
      this.logger.error(`Error updating expense with ID ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.expenseModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`Expense with ID ${id} not found`);
      }
    } catch (error) {
      this.logger.error(`Error removing expense with ID ${id}:`, error);
      throw error;
    }
  }

  async findByUserId(userId: string, query: any = {}): Promise<Expense[]> {
    try {
      return await this.expenseModel.find({ userId, ...query }).exec();
    } catch (error) {
      this.logger.error(`Error finding expenses for user ${userId}:`, error);
      throw error;
    }
  }

  async findByCompanyId(companyId: string, query: any = {}): Promise<Expense[]> {
    try {
      return await this.expenseModel.find({ companyId, ...query }).exec();
    } catch (error) {
      this.logger.error(`Error finding expenses for company ${companyId}:`, error);
      throw error;
    }
  }

  async getExpenseSummary(userId: string, startDate: Date, endDate: Date): Promise<{
    total: number;
    count: number;
    average: number;
    categories: Record<string, number>;
  }> {
    const expenses = await this.expenseModel.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).exec();
    
    if (!expenses || expenses.length === 0) {
      return {
        total: 0,
        count: 0,
        average: 0,
        categories: {},
      };
    }
    
    // Calculate summary
    const initialSummary = {
      total: 0,
      count: 0,
      average: 0,
      categories: {} as Record<string, number>
    };
    
    const summary = expenses.reduce((acc, expense) => {
      acc.total += expense.amount;
      acc.count += 1;
      const categoryId = expense.categoryId?.toString() || 'uncategorized';
      acc.categories[categoryId] = (acc.categories[categoryId] || 0) + expense.amount;
      return acc;
    }, initialSummary);
    
    summary.average = summary.total / summary.count;
    
    return {
      total: summary.total,
      count: summary.count,
      average: summary.average,
      categories: summary.categories
    };
  }
} 