import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExpenseDocument } from '@fresh-expense/types';
import { Budget, BudgetDocument } from './schemas/budget.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { AuthenticatedRequest } from '@/modules/auth/interfaces/authenticated-request.interface';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { MongoDBService } from '../../services/database/mongodb.service';
import {
  EXPENSE_COLLECTION,
  BUDGET_COLLECTION,
} from '../../services/database/schemas/expense.schema';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(
    @InjectModel(Expense.name) private readonly expenseModel: Model<ExpenseDocument>,
    @InjectModel(Budget.name) private readonly budgetModel: Model<BudgetDocument>,
    private readonly mongoDBService: MongoDBService
  ) {}

  async create(createExpenseDto: CreateExpenseDto, req: AuthenticatedRequest) {
    const expense = {
      ...createExpenseDto,
      userId: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await this.mongoDBService.getCollection(EXPENSE_COLLECTION).insertOne(expense);
    return { ...expense, _id: result.insertedId };
  }

  async findAll(req: AuthenticatedRequest) {
    return this.mongoDBService
      .getCollection(EXPENSE_COLLECTION)
      .find({ userId: req.user.id })
      .toArray();
  }

  async findOne(id: string, req: AuthenticatedRequest) {
    const expense = await this.mongoDBService
      .getCollection(EXPENSE_COLLECTION)
      .findOne({ _id: id, userId: req.user.id });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, req: AuthenticatedRequest) {
    const expense = await this.findOne(id, req);
    const updatedExpense = {
      ...expense,
      ...updateExpenseDto,
      updatedAt: new Date(),
    };
    await this.mongoDBService
      .getCollection(EXPENSE_COLLECTION)
      .updateOne({ _id: id }, { $set: updatedExpense });
    return updatedExpense;
  }

  async remove(id: string, req: AuthenticatedRequest) {
    const expense = await this.findOne(id, req);
    await this.mongoDBService.getCollection(EXPENSE_COLLECTION).deleteOne({ _id: id });
    return expense;
  }

  // Budget Management
  async createBudget(createBudgetDto: CreateBudgetDto, req: AuthenticatedRequest) {
    const budget = {
      ...createBudgetDto,
      userId: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await this.mongoDBService.getCollection(BUDGET_COLLECTION).insertOne(budget);
    return { ...budget, _id: result.insertedId };
  }

  async getBudgets(req: AuthenticatedRequest): Promise<Budget[]> {
    return this.budgetModel.find({ userId: req.user.id }).exec();
  }

  async updateBudget(id: string, updateBudgetDto: UpdateBudgetDto, req: AuthenticatedRequest) {
    const budget = await this.mongoDBService
      .getCollection(BUDGET_COLLECTION)
      .findOne({ _id: id, userId: req.user.id });
    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }
    const updatedBudget = {
      ...budget,
      ...updateBudgetDto,
      updatedAt: new Date(),
    };
    await this.mongoDBService
      .getCollection(BUDGET_COLLECTION)
      .updateOne({ _id: id }, { $set: updatedBudget });
    return updatedBudget;
  }

  async deleteBudget(id: string, req: AuthenticatedRequest) {
    const budget = await this.mongoDBService
      .getCollection(BUDGET_COLLECTION)
      .findOne({ _id: id, userId: req.user.id });
    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }
    await this.mongoDBService.getCollection(BUDGET_COLLECTION).deleteOne({ _id: id });
    return budget;
  }

  // Budget Tracking
  async getBudgetStatus(userId: string, budgetId: string): Promise<any> {
    const budget = await this.budgetModel.findById(budgetId).exec();
    const expenses = await this.expenseModel
      .find({
        userId,
        category: budget.category,
        date: {
          $gte: budget.startDate,
          $lte: budget.endDate,
        },
      })
      .exec();

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = budget.amount - totalSpent;
    const percentageUsed = (totalSpent / budget.amount) * 100;

    return {
      budget,
      totalSpent,
      remaining,
      percentageUsed,
      expenses,
    };
  }

  // Recurring Expenses
  async createRecurringExpense(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const recurringExpense = new this.expenseModel({
      ...createExpenseDto,
      isRecurring: true,
      recurringDetails: {
        frequency: createExpenseDto.recurringDetails.frequency,
        nextDate: this.calculateNextDate(createExpenseDto.recurringDetails),
      },
    });
    return recurringExpense.save();
  }

  async processRecurringExpenses(): Promise<void> {
    const now = new Date();
    const recurringExpenses = await this.expenseModel
      .find({
        isRecurring: true,
        'recurringDetails.nextDate': { $lte: now },
      })
      .exec();

    for (const expense of recurringExpenses) {
      // Create new expense instance
      const newExpense = new this.expenseModel({
        ...expense.toObject(),
        _id: undefined,
        date: now,
        recurringDetails: {
          ...expense.recurringDetails,
          nextDate: this.calculateNextDate(expense.recurringDetails),
        },
      });
      await newExpense.save();
    }
  }

  private calculateNextDate(recurringDetails: any): Date {
    const nextDate = new Date(recurringDetails.nextDate);
    switch (recurringDetails.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
    return nextDate;
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

  async getExpenseSummary(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    total: number;
    count: number;
    average: number;
    categories: Record<string, number>;
  }> {
    const expenses = await this.expenseModel
      .find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      })
      .exec();

    if (!expenses || expenses.length != null) {
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
      categories: {} as Record<string, number>,
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
      categories: summary.categories,
    };
  }
}
