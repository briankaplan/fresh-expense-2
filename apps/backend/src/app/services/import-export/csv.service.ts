import { Injectable, Logger } from '@nestjs/common';
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { ReceiptDocument, Receipt, Transaction } from '@fresh-expense/types';
import { TransactionDocument } from '@fresh-expense/types';

interface CSVExpense {
  merchant: string;
  amount: string | number;
  date: string | Date;
  category?: string;
  description?: string;
  type?: string;
  items?: Array<{
    description: string;
    amount: number;
    quantity?: number;
    price?: number;
  }>;
}

interface BankTransaction {
  date: string;
  description: string;
  amount: string;
  type?: string;
  category?: string;
}

interface ExpensifyTransaction {
  date: string;
  merchant: string;
  amount: string;
  category?: string;
  expenseId: string;
  reimbursable: 'Yes' | 'No';
}

@Injectable()
export class CSVService {
  private readonly logger = new Logger(CSVService.name);

  constructor(
    @InjectModel('Receipt') private readonly receiptModel: Model<ReceiptDocument>,
    @InjectModel('Transaction') private readonly transactionModel: Model<TransactionDocument>
  ) {}

  /**
   * Parse CSV content
   */
  async parseCSV<T = CSVExpense>(content: string): Promise<T[]> {
    try {
      return parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: true,
      });
    } catch (error) {
      this.logger.error('Error parsing CSV:', error);
      throw error;
    }
  }

  /**
   * Export receipts to CSV
   */
  async exportReceipts(receipts: ReceiptDocument[]): Promise<string> {
    const data = receipts.map(receipt => ({
      merchant: receipt.merchant,
      amount: receipt.amount,
      date: receipt.date,
      category: receipt.category,
      imageUrl: receipt.fullImageUrl,
      ocrText: receipt.metadata?.ocrData?.text,
      metadata: {
        status: receipt.status,
        matchConfidence: receipt.matchConfidence,
        createdAt: receipt.createdAt,
        updatedAt: receipt.updatedAt
      },
    }));

    return stringify(data, {
      header: true,
      columns: [
        'merchant',
        'amount',
        'date',
        'category',
        'imageUrl',
        'ocrText',
        'metadata'
      ],
    });
  }

  /**
   * Import receipts from CSV
   */
  async importReceipts(content: string): Promise<ReceiptDocument[]> {
    try {
      const expenses = await this.parseCSV<CSVExpense>(content);
      const receipts: ReceiptDocument[] = [];

      for (const expense of expenses) {
        const receipt = new this.receiptModel({
          date: new Date(expense.date),
          merchant: expense.merchant,
          amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount,
          category: expense.category,
          description: expense.description,
          source: 'CSV',
          metadata: {
            processedAt: new Date(),
            source: 'csv_import',
            extractedData: {
              merchant: expense.merchant,
              date: new Date(expense.date),
              amount:
                typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount,
              items: expense.items || [],
            },
          },
        });

        await receipt.save();
        receipts.push(receipt);
      }

      return receipts;
    } catch (error) {
      this.logger.error('Error importing receipts from CSV:', error);
      throw error;
    }
  }

  /**
   * Import bank transactions from CSV
   */
  async importBankTransactions(content: string, userId: string): Promise<TransactionDocument[]> {
    try {
      const csvTransactions = await this.parseCSV<BankTransaction>(content);
      const transactions: TransactionDocument[] = [];

      for (const csvTx of csvTransactions) {
        const transaction = new this.transactionModel({
          accountId: userId,
          date: new Date(csvTx.date),
          description: csvTx.description,
          amount: {
            value: parseFloat(csvTx.amount),
            currency: 'USD'
          },
          category: csvTx.category || 'Uncategorized',
          merchant: {
            name: csvTx.description,
            category: csvTx.category
          },
          status: 'COMPLETED',
          type: csvTx.type?.toUpperCase() || 'DEBIT',
          source: 'import',
          metadata: {
            importDate: new Date(),
            source: 'bank_csv'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });

        await transaction.save();
        transactions.push(transaction);
      }

      return transactions;
    } catch (error) {
      this.logger.error('Error importing bank transactions from CSV:', error);
      throw error;
    }
  }

  /**
   * Import Expensify transactions from CSV
   */
  async importExpensifyTransactions(content: string, userId: string): Promise<TransactionDocument[]> {
    try {
      const csvTransactions = await this.parseCSV<ExpensifyTransaction>(content);
      const transactions: TransactionDocument[] = [];

      for (const csvTx of csvTransactions) {
        const transaction = new this.transactionModel({
          accountId: userId,
          date: new Date(csvTx.date),
          description: csvTx.merchant,
          amount: {
            value: parseFloat(csvTx.amount),
            currency: 'USD'
          },
          category: csvTx.category || 'Uncategorized',
          merchant: {
            name: csvTx.merchant,
            category: csvTx.category
          },
          status: 'COMPLETED',
          type: 'EXPENSE',
          source: 'import',
          metadata: {
            expensifyId: csvTx.expenseId,
            reimbursable: csvTx.reimbursable === 'Yes',
            importDate: new Date()
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });

        await transaction.save();
        transactions.push(transaction);
      }

      return transactions;
    } catch (error) {
      this.logger.error('Error importing Expensify transactions from CSV:', error);
      throw error;
    }
  }
}
