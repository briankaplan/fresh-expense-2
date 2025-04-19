import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Receipt, Merchant } from '@fresh-expense/types';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  database: Record<string, boolean>;
  services: Record<string, string>;
  memory: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    usagePercentage: string;
    isCritical: boolean;
  };
  cpu: {
    user: string;
    system: string;
  };
  issues: Array<{
    type: string;
    severity: 'critical' | 'high' | 'medium';
    message: string;
    count?: number;
    details?: any;
  }>;
  warnings: Array<{
    type: string;
    message: string;
  }>;
}

interface Issue {
  type: string;
  severity: 'critical' | 'high' | 'medium';
  message: string;
  count?: number;
  details?: any;
}

interface Warning {
  type: string;
  message: string;
}

interface CollectionIndex {
  model: Model<any>;
  indexes: string[];
}

interface MissingIndex {
  collection: string;
  index: string;
}

interface HealthStatusParams {
  dbStatus: Record<string, boolean>;
  memoryUsagePercentage: number;
  isMemoryCritical: boolean;
  isUptimeCritical: boolean;
  issues: Issue[];
}

interface WarningParams {
  isMemoryCritical: boolean;
  isUptimeCritical: boolean;
  issues: Issue[];
}

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);
  private readonly MEMORY_THRESHOLD = 0.9; // 90% memory usage threshold
  private readonly UPTIME_THRESHOLD = 7 * 24 * 60 * 60; // 7 days in seconds

  constructor(
    @InjectModel('Expense') private expenseModel: Model<any>,
    @InjectModel('Receipt') private receiptModel: Model<Receipt>,
    @InjectModel('Merchant') private merchantModel: Model<Merchant>,
    @InjectModel('Subscription') private subscriptionModel: Model<any>
  ) {}

  async getHealthCheck(): Promise<HealthStatus> {
    try {
      const uptimeSeconds = process.uptime();
      const environment = process.env.NODE_ENV || 'development';
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      // Check database connections and performance
      const dbStatus = {
        expenses: await this.checkCollection(this.expenseModel),
        receipts: await this.checkCollection(this.receiptModel),
        merchants: await this.checkCollection(this.merchantModel),
        subscriptions: await this.checkCollection(this.subscriptionModel),
      };

      // Check for critical issues
      const issues = await this.checkForCriticalIssues();

      // Calculate memory usage percentage
      const memoryUsagePercentage = memoryUsage.heapUsed / memoryUsage.heapTotal;
      const isMemoryCritical = memoryUsagePercentage > this.MEMORY_THRESHOLD;
      const isUptimeCritical = uptimeSeconds > this.UPTIME_THRESHOLD;

      const services = {
        Database: Object.values(dbStatus).every(status => status) ? 'connected' : 'disconnected',
        'API Server': 'initialized',
        'Receipt Processing': 'initialized',
        'Transaction Sync': 'initialized',
      };

      // Determine overall health status
      const status = this.determineHealthStatus({
        dbStatus,
        memoryUsagePercentage,
        isMemoryCritical,
        isUptimeCritical,
        issues
      });

      return {
        status,
        timestamp: new Date().toISOString(),
        uptime: uptimeSeconds,
        environment,
        database: dbStatus,
        services,
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          usagePercentage: `${(memoryUsagePercentage * 100).toFixed(2)}%`,
          isCritical: isMemoryCritical
        },
        cpu: {
          user: `${(cpuUsage.user / 1000000).toFixed(2)}s`,
          system: `${(cpuUsage.system / 1000000).toFixed(2)}s`
        },
        issues,
        warnings: this.generateWarnings({
          isMemoryCritical,
          isUptimeCritical,
          issues
        })
      };
    } catch (error) {
      this.logger.error('Error in health check:', error);
      throw error;
    }
  }

  private async checkForCriticalIssues(): Promise<Issue[]> {
    const issues: Issue[] = [];

    // Check for unprocessed receipts
    const unprocessedReceipts = await this.receiptModel.countDocuments({ status: 'pending' });
    if (unprocessedReceipts > 100) {
      issues.push({
        type: 'unprocessed_receipts',
        severity: 'high',
        message: `There are ${unprocessedReceipts} unprocessed receipts`,
        count: unprocessedReceipts
      });
    }

    // Check for failed transactions
    const failedTransactions = await this.expenseModel.countDocuments({ status: 'failed' });
    if (failedTransactions > 0) {
      issues.push({
        type: 'failed_transactions',
        severity: 'critical',
        message: `There are ${failedTransactions} failed transactions`,
        count: failedTransactions
      });
    }

    // Check for database indexes
    const missingIndexes = await this.checkMissingIndexes();
    if (missingIndexes.length > 0) {
      issues.push({
        type: 'missing_indexes',
        severity: 'medium',
        message: 'Some collections are missing recommended indexes',
        details: missingIndexes
      });
    }

    return issues;
  }

  private async checkMissingIndexes(): Promise<MissingIndex[]> {
    const missingIndexes: MissingIndex[] = [];
    
    // Check indexes for each collection
    const collections: CollectionIndex[] = [
      { model: this.expenseModel, indexes: ['date', 'category', 'merchant'] },
      { model: this.receiptModel, indexes: ['status', 'date'] },
      { model: this.merchantModel, indexes: ['name'] },
      { model: this.subscriptionModel, indexes: ['status', 'nextBillingDate'] }
    ];

    for (const { model, indexes } of collections) {
      const existingIndexes = await model.collection.indexes();
      const existingIndexNames = existingIndexes.map(idx => Object.keys(idx.key)[0]);
      
      for (const index of indexes) {
        if (!existingIndexNames.includes(index)) {
          missingIndexes.push({
            collection: model.modelName,
            index
          });
        }
      }
    }

    return missingIndexes;
  }

  private determineHealthStatus(params: HealthStatusParams): 'healthy' | 'degraded' | 'unhealthy' {
    const { dbStatus, issues, isMemoryCritical, isUptimeCritical } = params;

    // Check for critical issues
    if (issues.some((issue: Issue) => issue.severity === 'critical')) {
      return 'unhealthy';
    }

    // Check database status
    if (!Object.values(dbStatus).every(status => status)) {
      return 'unhealthy';
    }

    // Check memory usage
    if (isMemoryCritical) {
      return 'degraded';
    }

    // Check uptime
    if (isUptimeCritical) {
      return 'degraded';
    }

    // Check for high severity issues
    if (issues.some((issue: Issue) => issue.severity === 'high')) {
      return 'degraded';
    }

    return 'healthy';
  }

  private generateWarnings(params: WarningParams): Warning[] {
    const { isMemoryCritical, isUptimeCritical, issues } = params;
    const warnings: Warning[] = [];

    if (isMemoryCritical) {
      warnings.push({
        type: 'memory_usage',
        message: 'Memory usage is approaching critical levels'
      });
    }

    if (isUptimeCritical) {
      warnings.push({
        type: 'uptime',
        message: 'Server has been running for an extended period'
      });
    }

    // Add warnings for medium severity issues
    issues
      .filter((issue: Issue) => issue.severity === 'medium')
      .forEach((issue: Issue) => {
        warnings.push({
          type: issue.type,
          message: issue.message
        });
      });

    return warnings;
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

      const matchedReceipts = transactions.filter(tx => tx.matched != null).length;

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
        const monthData = monthlyData.find(m => m.yearMonth != null);
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
