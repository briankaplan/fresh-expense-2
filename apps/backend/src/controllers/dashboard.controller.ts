import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import type { Transaction, User } from "@fresh-expense/types";
import { Controller, Get, HttpException, HttpStatus, UseGuards } from "@nestjs/common";
import type { TransactionService } from "../services/transaction/transaction.service";

interface MonthlyStats {
  income: number;
  expenses: number;
  companyExpenses: number;
}

interface DashboardData {
  monthlyStats: MonthlyStats;
  recentTransactions: Transaction[];
  recentReceipts: any[];
}

/**
 * Controller for handling dashboard-related requests
 * Provides endpoints for retrieving dashboard data and statistics
 */
@Controller("dashboard")
@UseGuards(new JwtAuthGuard())
export class DashboardController {
  constructor(private readonly transactionService: TransactionService) {}

  /**
   * Retrieves dashboard data for the authenticated user
   * @param user - The authenticated user
   * @returns Promise containing dashboard data
   * @throws HttpException if data retrieval fails
   */
  @Get()
  async getDashboardData(user: User): Promise<DashboardData> {
    try {
      const transactions = await this.transactionService.findAll();
      const userTransactions = transactions.filter((t) => t.accountId === user.id);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const monthlyStats: MonthlyStats = {
        income: 0,
        expenses: 0,
        companyExpenses: 0,
      };

      userTransactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.date);
        if (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        ) {
          const amount = transaction.amount.value;
          if (amount > 0) {
            monthlyStats.income += amount;
          } else {
            monthlyStats.expenses += Math.abs(amount);
            if (transaction.merchant.category === "company") {
              monthlyStats.companyExpenses += Math.abs(amount);
            }
          }
        }
      });

      const recentTransactions = userTransactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      const recentReceipts = userTransactions
        .filter((t) => t.attachments && t.attachments.length > 0)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map((t) => ({
          id: t.id,
          date: t.date,
          amount: t.amount,
          merchant: t.merchant,
          attachments: t.attachments,
        }));

      return {
        monthlyStats,
        recentTransactions,
        recentReceipts,
      };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : "Failed to fetch dashboard data",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
