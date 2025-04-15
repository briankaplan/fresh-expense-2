import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../app/users/decorators/user.decorator';
import { TransactionService } from '../services/teller/teller.service';
import { ReceiptService } from '../services/receipt/receipt.service';
import { UserType } from '../app/users/schemas/user.schema';
import { Receipt } from '../app/schemas/receipt.schema';
import { Transaction } from '../app/schemas/transaction.schema';

interface MonthlyStats {
  income: number[];
  expenses: number[];
}

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly receiptService: ReceiptService
  ) {}

  @Get()
  async getDashboardData(@User() user: UserType) {
    const [transactions, receipts] = (await Promise.all([
      this.transactionService.findByUserId(user.id),
      this.receiptService.findByUserId(user.id),
    ])) as [Transaction[], Receipt[]];

    // Calculate monthly income and expenses
    const monthlyStats = transactions.reduce(
      (acc: MonthlyStats, t) => {
        const month = new Date(t.date).getMonth();
        if (t.amount > 0) {
          acc.income[month] = (acc.income[month] || 0) + t.amount;
        } else {
          acc.expenses[month] = (acc.expenses[month] || 0) + Math.abs(t.amount);
        }
        return acc;
      },
      { income: Array(12).fill(0), expenses: Array(12).fill(0) }
    );

    // Calculate company expenses
    const companyExpenses = transactions
      .filter(t => t.amount < 0 && t.merchantInfo?.name)
      .reduce(
        (acc, t) => {
          const company = t.merchantInfo?.name || 'Unknown';
          acc[company] = (acc[company] || 0) + Math.abs(t.amount);
          return acc;
        },
        {} as Record<string, number>
      );

    // Calculate category breakdown
    const categoryBreakdown = transactions
      .filter(t => t.amount < 0)
      .reduce(
        (acc, t) => {
          const category = t.category || 'Uncategorized';
          acc[category] = (acc[category] || 0) + Math.abs(t.amount);
          return acc;
        },
        {} as Record<string, number>
      );

    // Get recent transactions
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Calculate receipt matching statistics
    const now = new Date();
    const lastBatchTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    const matchedReceipts = receipts.filter(r => r.transactionId);
    const highConfidenceMatches = matchedReceipts.filter(r => r.confidence && r.confidence > 0.8);

    const receiptMatching = {
      waitingToMatch: receipts.filter(r => !r.transactionId).length,
      matchedThisBatch: receipts.filter(
        r => r.transactionId && r.updatedAt && new Date(r.updatedAt) > lastBatchTime
      ).length,
      lastBatchTime: lastBatchTime.toISOString(),
      totalMatched: matchedReceipts.length,
      matchAccuracy:
        matchedReceipts.length > 0
          ? (highConfidenceMatches.length / matchedReceipts.length) * 100
          : 0,
    };

    return {
      monthlyStats,
      companyExpenses,
      categoryBreakdown,
      recentTransactions,
      receiptMatching,
      totalTransactions: transactions.length,
      totalReceipts: receipts.length,
      unmatchedReceipts: receipts.filter(r => !r.transactionId).length,
    };
  }
}
