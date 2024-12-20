'use client';

import { parse } from 'csv-parse/sync';
import { prisma } from '@/lib/prisma';
import { Prisma, Expense, Transaction } from '@prisma/client';
import { matchMerchants } from '@/utils/merchantMatching';

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category?: string;
}

interface ExpensifyRow {
  Date: string;
  Merchant: string;
  Amount: string;
  Category: string;
  Description: string;
  'Report Currency': string;
  'Transaction Type': string;
  'Report ID': string;
  Receipt?: string;
}

interface ParsedExpense {
  date: Date;
  merchant: string;
  amount: number;
  category: string;
  description: string;
  currency: string;
  type: 'credit' | 'debit';
  expenseType: 'business' | 'personal';
  metadata: {
    originalAmount: number;
    detectedAs: string;
    paymentIndicators: Record<string, boolean>;
    matchedRules: string[];
  };
}

export async function parseBankStatement(content: string): Promise<BankTransaction[]> {
  try {
    // First, clean up the content by removing empty lines
    const cleanContent = content
      .split('\n')
      .filter(line => line.trim() && !line.split(',').every(cell => !cell.trim()))
      .join('\n');

    // Parse CSV content
    const records = parse(cleanContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Filter out empty rows and payments
    const validRecords = records.filter((record: any) => {
      return record['Transaction Date'] && 
             record['Description'] && 
             record['Expenses Amount'] &&
             !record['Description'].includes('Payment Thank You');
    });

    // Map CSV records to BankTransaction objects
    return validRecords.map((record: any, index: number) => ({
      id: `bank-${Date.now()}-${index}`,
      date: parseDate(record['Transaction Date']),
      description: cleanMerchantName(record['Description']),
      amount: parseAmount(record['Expenses Amount']),
      type: parseAmount(record['Expenses Amount']) < 0 ? 'debit' : 'credit',
      category: mapCategory(record['Category'] || ''),
    }));

  } catch (error) {
    console.error('Failed to parse bank statement:', error);
    throw new Error('Invalid bank statement format');
  }
}

export async function parseExpensifyCSV(csvContent: string, userId: string) {
  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true
    }) as ExpensifyRow[];

    // Get existing transactions for matching
    const existingTransactions = await prisma.transaction.findMany({
      where: { userId }
    });

    const expenses: Prisma.ExpenseCreateInput[] = [];
    
    for (const record of records) {
      const rawAmount = parseFloat(record.Amount || '0');
      
      // Payment detection logic
      const isPayment = detectPayment(record, rawAmount);
      const amount = isPayment ? Math.abs(rawAmount) : -Math.abs(rawAmount);
      
      // Business/Personal detection
      const isBusiness = detectBusinessExpense(record);

      // Create base expense data
      const expenseData: Prisma.ExpenseCreateInput = {
        date: new Date(record.Date),
        merchant: cleanMerchantName(record.Merchant),
        amount,
        category: mapCategory(record.Category),
        description: record.Description,
        currency: record['Report Currency'] || 'USD',
        type: isPayment ? 'credit' : 'debit',
        expenseType: isBusiness ? 'business' : 'personal',
        status: 'pending',
        reportId: record['Report ID'],
        hasReceipt: Boolean(record.Receipt),
        receiptUrl: record.Receipt,
        user: { connect: { id: userId } },
      };

      // Try to match with existing transaction
      const matchedTransaction = matchMerchants(
        expenseData,
        existingTransactions
      );

      if (matchedTransaction) {
        expenseData.transaction = {
          connect: { id: matchedTransaction.id }
        };
        expenseData.status = 'matched';
      }

      expenses.push(expenseData);
    }

    // Batch create expenses
    const createdExpenses = await prisma.$transaction(
      expenses.map(expense => 
        prisma.expense.create({
          data: expense,
          include: {
            transaction: true,
            user: true
          }
        })
      )
    );

    // Generate summary
    const summary = generateSummary(createdExpenses);
    console.log('Expensify Import Summary:', summary);

    return createdExpenses;

  } catch (error) {
    console.error('Error parsing Expensify CSV:', error);
    throw new Error('Invalid Expensify format');
  }
}

function detectPayment(record: ExpensifyRow, amount: number): boolean {
  return (
    record['Transaction Type']?.toLowerCase().includes('payment') ||
    record['Transaction Type']?.toLowerCase().includes('credit') ||
    record['Transaction Type']?.toLowerCase().includes('refund') ||
    record.Description?.toLowerCase().includes('payment') ||
    record.Description?.toLowerCase().includes('refund') ||
    record.Description?.toLowerCase().includes('credit') ||
    record.Description?.toLowerCase().includes('return') ||
    record.Category?.toLowerCase().includes('payment') ||
    record.Category?.toLowerCase().includes('refund') ||
    amount < 0
  );
}

function detectBusinessExpense(record: ExpensifyRow): boolean {
  return (
    record.Category?.toLowerCase().includes('dh:') ||
    record.Category?.toLowerCase().includes('business') ||
    record.Description?.toLowerCase().includes('business')
  );
}

function generateSummary(expenses: Expense[]) {
  return {
    totalRecords: expenses.length,
    totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
    matched: expenses.filter(e => e.status === 'matched').length,
    unmatched: expenses.filter(e => e.status === 'pending').length,
    business: expenses.filter(e => e.expenseType === 'business').length,
    personal: expenses.filter(e => e.expenseType === 'personal').length,
    withReceipts: expenses.filter(e => e.hasReceipt).length
  };
}

// Helper functions
function parseDate(dateStr: string): string {
  try {
    const [month, day, year] = dateStr.split('/');
    return new Date(`20${year}`, month - 1, day).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function parseAmount(amountStr: string): number {
  return Math.abs(parseFloat(
    amountStr?.replace(/[^0-9.-]/g, '')?.replace(/,/g, '') || '0'
  ));
}

function cleanMerchantName(name: string): string {
  return name
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .replace(/\*+/g, '')
    .replace(/[^\w\s&-]/g, '')
    .replace(/(?:TST|SQ|DD)\s*\*?\s*/i, '')
    .trim();
}

function mapCategory(bankCategory: string): string {
  const categoryMap: Record<string, string> = {
    'Food & Drink': 'food',
    'Travel': 'transportation',
    'Shopping': 'shopping',
    'Entertainment': 'entertainment',
    'Bills & Utilities': 'utilities',
    'Health & Wellness': 'healthcare',
    'Professional Services': 'business',
    'Fees & Adjustments': 'fees',
    'Gifts & Donations': 'donations',
    'Home': 'housing',
    'Personal': 'personal',
    'Groceries': 'groceries',
  };
  return categoryMap[bankCategory] || 'other';
}