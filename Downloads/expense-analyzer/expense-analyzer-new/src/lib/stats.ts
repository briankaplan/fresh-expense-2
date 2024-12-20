import { Transaction, Expense } from '@prisma/client';

interface Stats {
  totalExpenses: number;
  pendingReceipts: number;
  matchRate: number;
  monthlyTotal: number;
  monthlyChange: number;
}

export function calculateStats(
  transactions: Transaction[],
  expenses: Expense[],
): Stats {
  // Calculate total expenses
  const totalExpenses = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  // Count pending receipts
  const pendingReceipts = expenses.filter(e => !e.isReconciled).length;

  // Calculate match rate
  const matchableTransactions = transactions.filter(t => t.type === 'debit').length;
  const matchedTransactions = transactions.filter(t => t.receiptId).length;
  const matchRate = matchableTransactions ? (matchedTransactions / matchableTransactions) * 100 : 0;

  // Calculate this month's total
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthlyTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  });
  const monthlyTotal = monthlyTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate month-over-month change
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
  const lastMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  });
  const lastMonthTotal = lastMonthTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlyChange = lastMonthTotal ? 
    ((monthlyTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

  return {
    totalExpenses,
    pendingReceipts,
    matchRate,
    monthlyTotal,
    monthlyChange,
  };
} 