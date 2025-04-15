import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense } from '../expense/schemas/expense.schema';
import { Receipt } from '../receipt/schemas/receipt.schema';
import { Merchant } from '../merchant/schemas/merchant.schema';
import { Subscription } from '../subscription/schemas/subscription.schema';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    @InjectModel(Receipt.name) private receiptModel: Model<Receipt>,
    @InjectModel(Merchant.name) private merchantModel: Model<Merchant>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<Subscription>
  ) {}

  async getHealthCheck() {
    try {
      const uptimeSeconds = process.uptime();
      const environment = process.env.NODE_ENV || 'development';
      const memoryUsage = process.memoryUsage();

      // Check database connections
      const dbStatus = {
        expenses: await this.checkCollection(this.expenseModel),
        receipts: await this.checkCollection(this.receiptModel),
        merchants: await this.checkCollection(this.merchantModel),
        subscriptions: await this.checkCollection(this.subscriptionModel),
      };

      const services = {
        Database: Object.values(dbStatus).every(status => status) ? 'connected' : 'disconnected',
        'API Server': 'initialized',
        'Receipt Processing': 'initialized',
        'Transaction Sync': 'initialized',
      };

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: uptimeSeconds,
        environment,
        database: dbStatus,
        services,
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        },
      };
    } catch (error) {
      this.logger.error('Error in health check:', error);
      throw error;
    }
  }

  private async checkCollection(model: Model<any>): Promise<boolean> {
    try {
      await model.findOne().exec();
      return true;
    } catch (error) {
      this.logger.warn(`Collection check failed for ${model.modelName}:`, error);
      return false;
    }
  }

  async getDashboardStats() {
    try {
      // Get recent transactions
      const transactions = await this.expenseModel.find().sort({ date: -1 }).limit(100).exec();

      // Calculate totals and stats
      const totalAmount = transactions.reduce((sum, tx) => {
        const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
        return sum + Math.abs(amount);
      }, 0);

      const matchedReceipts = transactions.filter(tx => tx.matched === true).length;

      // Group by category
      const categoryMap = {};
      transactions.forEach(tx => {
        const category = tx.category || 'Uncategorized';
        if (!categoryMap[category]) {
          categoryMap[category] = { count: 0, total: 0 };
        }
        categoryMap[category].count++;
        const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
        categoryMap[category].total += Math.abs(amount);
      });

      // Create monthly data
      const monthlyData = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const yearMonth = monthDate.toISOString().substring(0, 7);
        monthlyData.push({
          month: yearMonth,
          year: monthDate.getFullYear(),
          monthNum: monthDate.getMonth() + 1,
          yearMonth,
          count: 0,
          total: 0,
        });
      }

      // Fill in monthly data
      transactions.forEach(tx => {
        if (!tx.date) return;
        const txDate = new Date(tx.date).toISOString().substring(0, 7);
        const monthData = monthlyData.find(m => m.yearMonth === txDate);
        if (monthData) {
          monthData.count++;
          const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
          monthData.total += Math.abs(amount);
        }
      });

      // Get subscription data
      const subscriptions = await this.subscriptionModel.find().exec();
      const subscriptionData = subscriptions.map(sub => ({
        name: sub.name,
        amount: sub.amount,
        frequency: sub.frequency,
        nextBillingDate: sub.nextBillingDate,
      }));

      return {
        totalAmount,
        totalTransactions: transactions.length,
        matchedReceipts,
        categories: Object.keys(categoryMap),
        categoryData: Object.entries(categoryMap).map(([name, data]) => ({
          name,
          count: data.count,
          total: data.total,
        })),
        monthlyData,
        subscriptions: subscriptionData,
      };
    } catch (error) {
      this.logger.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  async getExpenseDetails(id: string) {
    try {
      const expense = await this.expenseModel.findById(id).exec();

      if (!expense) {
        throw new Error('Expense not found');
      }

      // Get receipt if exists
      let receipt = null;
      if (expense.receiptId) {
        receipt = await this.receiptModel
          .findOne({
            $or: [{ _id: expense.receiptId }, { expense_id: expense._id }],
          })
          .exec();
      }

      return {
        expense,
        receipt,
      };
    } catch (error) {
      this.logger.error('Error getting expense details:', error);
      throw error;
    }
  }
}
