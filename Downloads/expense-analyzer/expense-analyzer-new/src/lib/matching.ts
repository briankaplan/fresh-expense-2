import { Expense, Receipt } from '@/types';
import { differenceInDays } from 'date-fns';

interface MatchResult {
  expense: Expense;
  receipt: Receipt;
  confidence: number;
}

export function findPotentialMatches(
  expense: Expense,
  receipts: Receipt[],
  options = { maxDaysDifference: 5, amountTolerance: 0.01 }
): MatchResult[] {
  const matches: MatchResult[] = [];
  const expenseDate = new Date(expense.date);
  const expenseAmount = expense.amount;

  for (const receipt of receipts) {
    const receiptDate = new Date(receipt.date);
    const daysDifference = Math.abs(differenceInDays(expenseDate, receiptDate));
    
    // Skip if dates are too far apart
    if (daysDifference > options.maxDaysDifference) continue;

    // Calculate amount difference percentage
    const amountDifference = Math.abs(expenseAmount - receipt.total) / expenseAmount;
    if (amountDifference > options.amountTolerance) continue;

    // Calculate match confidence
    const dateConfidence = 1 - (daysDifference / options.maxDaysDifference);
    const amountConfidence = 1 - (amountDifference / options.amountTolerance);
    const confidence = (dateConfidence + amountConfidence) / 2;

    matches.push({
      expense,
      receipt,
      confidence
    });
  }

  // Sort by confidence
  return matches.sort((a, b) => b.confidence - a.confidence);
} 