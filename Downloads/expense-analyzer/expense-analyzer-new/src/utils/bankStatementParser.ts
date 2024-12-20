'use client';

import { BankTransaction } from '@/types';
import { Logger } from '@/utils/logger';
import { merchantMappingService } from './merchantMapping';
import Papa from 'papaparse';
import pdfjs from 'pdfjs-dist';
import { formatDate, isValidDate } from './dateUtils';
import { transactionService } from '@/services/db/transactionService';

interface ParserOptions {
  bank?: 'chase' | 'amex' | 'citi' | 'wells_fargo' | 'bofa' | 'discover';
  dateFormat?: string;
  skipLines?: number;
  validateData?: boolean;
  normalizeDescriptions?: boolean;
  detectDuplicates?: boolean;
  categorizeTransactions?: boolean;
  extractMerchants?: boolean;
  enhancedValidation?: boolean;
}

interface ParseResult {
  transactions: BankTransaction[];
  metadata: {
    totalCount: number;
    validCount: number;
    invalidCount: number;
    duplicateCount: number;
    totalAmount: number;
    dateRange: {
      start: Date;
      end: Date;
    };
    categories: Record<string, number>;
    merchants: Record<string, number>;
    patterns: {
      recurring: number;
      roundAmounts: number;
      splitPayments: number;
    };
  };
  errors?: Array<{
    line: number;
    error: string;
    data?: any;
    suggestion?: string;
  }>;
}

const BANK_FORMATS = {
  chase: {
    headers: [
      'Transaction Date',
      'Post Date',
      'Description',
      'Category',
      'Type',
      'Amount',
      'Memo'
    ],
    dateFields: ['Transaction Date', 'Post Date'],
    amountField: 'Amount',
    descriptionField: 'Description',
    patterns: {
      date: /^\d{2}\/\d{2}\/\d{4}$/,
      amount: /^-?\$?\d+\.\d{2}$/,
      merchantCodes: /(?:SWP|ACH|POS|ATM|DBT|WDL)/i
    }
  },
  amex: {
    headers: [
      'Date',
      'Description',
      'Amount',
      'Extended Details',
      'Appears On Your Statement As',
      'Address',
      'Category'
    ],
    dateFields: ['Date'],
    amountField: 'Amount',
    descriptionField: 'Description',
    patterns: {
      date: /^\d{2}\/\d{2}\/\d{2}$/,
      amount: /^-?\$?\d+,?\d+\.\d{2}$/
    }
  },
  citi: {
    headers: [
      'Status',
      'Date',
      'Description',
      'Debit',
      'Credit',
      'Member Name',
      'Category'
    ],
    dateFields: ['Date'],
    amountFields: ['Debit', 'Credit'],
    descriptionField: 'Description',
    patterns: {
      date: /^\d{2}\/\d{2}\/\d{4}$/,
      amount: /^-?\$?\d+,?\d+\.\d{2}$/,
      merchantCodes: /(?:PYMT|BILL|POS|ATM)/i
    }
  },
  wells_fargo: {
    headers: [
      'Date',
      'Amount',
      'Description',
      'Type',
      'Balance',
      'Check or Slip #'
    ],
    dateFields: ['Date'],
    amountField: 'Amount',
    descriptionField: 'Description',
    patterns: {
      date: /^\d{2}\/\d{2}\/\d{4}$/,
      amount: /^-?\$?\d+,?\d+\.\d{2}$/,
      merchantCodes: /(?:POS|ATM|ACH|CHECK)/i
    }
  }
};

class BankStatementParser {
  private readonly TRANSACTION_PATTERNS = {
    recurring: [
      /RECURRING/i,
      /SUBSCRIPTION/i,
      /MONTHLY(?:\s+PMT)?/i,
      /AUTO-?PAY/i,
      /BILL\s+PAY/i
    ],
    splitPayment: [
      /SPLIT/i,
      /PARTIAL/i,
      /PAYMENT\s+\d+\/\d+/i,
      /INSTALLMENT/i
    ],
    refund: [
      /REFUND/i,
      /RETURN/i,
      /CREDIT(?:\s+MEMO)?/i,
      /REVERSAL/i,
      /CHARGEBACK/i
    ],
    transfer: [
      /TRANSFER/i,
      /XFER/i,
      /ZEL(?:LE)?/i,
      /VENMO/i,
      /PAYPAL/i,
      /(?:INTERNAL|EXTERNAL)\s+TRANSFER/i
    ],
    check: [
      /CHECK\s+#?\d+/i,
      /CHK\s+\d+/i,
      /CHEQUE/i
    ],
    atm: [
      /ATM\s+(?:WITHDRAWAL|DEPOSIT)/i,
      /(?:CASH\s+)?WITHDRAWAL/i,
      /(?:CASH\s+)?DEPOSIT/i
    ]
  };

  async parseCSV(
    file: File,
    options: ParserOptions = {}
  ): Promise<ParseResult> {
    try {
      const result = this.initializeParseResult();
      const bank = options.bank || await this.detectBankFromCSV(file);
      const bankFormat = BANK_FORMATS[bank];

      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
          complete: async (results) => {
            try {
              // Validate headers
              this.validateHeaders(results.meta.fields || [], bankFormat.headers);

              // Process rows with enhanced validation and pattern detection
              const seenTransactions = new Map<string, BankTransaction>();
              
              for (let i = 0; i < results.data.length; i++) {
                try {
                  const row = results.data[i];
                  result.metadata.totalCount++;

                  // Transform and validate row
                  const transaction = await this.processRow(row, bank, options);

                  // Handle duplicates with smart merging
                  const transactionKey = this.generateTransactionKey(transaction);
                  if (seenTransactions.has(transactionKey)) {
                    const existing = seenTransactions.get(transactionKey)!;
                    const merged = this.mergeTransactions(existing, transaction);
                    seenTransactions.set(transactionKey, merged);
                    result.metadata.duplicateCount++;
                    continue;
                  }

                  // Update metadata and patterns
                  this.updateMetadata(result, transaction);
                  this.detectAndUpdatePatterns(result, transaction);

                  seenTransactions.set(transactionKey, transaction);
                  result.transactions.push(transaction);
                  result.metadata.validCount++;
                } catch (error) {
                  this.handleError(result, i, error, results.data[i]);
                }
              }

              // Post-processing
              if (options.categorizeTransactions) {
                await this.categorizeBatch(result.transactions);
              }

              resolve(result);
            } catch (error) {
              reject(error);
            }
          },
          error: (error) => reject(error)
        });
      });
    } catch (error) {
      Logger.error('Failed to parse CSV', { error });
      throw error;
    }
  }

  private async processRow(
    row: any,
    bank: ParserOptions['bank'],
    options: ParserOptions
  ): Promise<BankTransaction> {
    const bankFormat = BANK_FORMATS[bank!];
    const transaction = await this.transformRow(row, bank);

    // Enhanced validation
    if (options.enhancedValidation) {
      await this.enhancedValidation(transaction, bankFormat);
    }

    // Merchant normalization and categorization
    if (options.normalizeDescriptions || options.categorizeTransactions) {
      const merchantInfo = await merchantMappingService.normalizeMerchantName(
        this.cleanDescription(transaction.description)
      );
      
      if (options.normalizeDescriptions) {
        transaction.merchant = merchantInfo.name;
      }
      
      if (options.categorizeTransactions) {
        transaction.category = merchantInfo.category;
      }
    }

    // Pattern detection
    transaction.metadata = {
      ...transaction.metadata,
      patterns: this.detectTransactionPatterns(transaction)
    };

    return transaction;
  }

  private cleanDescription(description: string): string {
    return description
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s-]/g, '')
      .replace(/\b(?:POS|DBT|ACH|SWP|ATM|WDL)\b/gi, '')
      .trim();
  }

  private detectTransactionPatterns(transaction: BankTransaction): string[] {
    const patterns: string[] = [];
    const description = transaction.description.toLowerCase();

    // Check each pattern category
    Object.entries(this.TRANSACTION_PATTERNS).forEach(([category, regexList]) => {
      if (regexList.some(regex => regex.test(description))) {
        patterns.push(category);
      }
    });

    // Check for round amounts
    if (Math.abs(Math.round(transaction.amount) - transaction.amount) < 0.01) {
      patterns.push('round_amount');
    }

    // Check for common payment amounts
    const commonAmounts = [5, 10, 20, 25, 50, 100];
    if (commonAmounts.includes(Math.abs(transaction.amount))) {
      patterns.push('common_amount');
    }

    return patterns;
  }

  private async validateTransaction(
    transaction: BankTransaction,
    bankFormat: typeof BANK_FORMATS[keyof typeof BANK_FORMATS]
  ): Promise<string[]> {
    const errors: string[] = [];

    // Date validation
    if (!isValidDate(transaction.date)) {
      errors.push('Invalid date format');
    } else {
      const txDate = new Date(transaction.date);
      const now = new Date();
      if (txDate > now) {
        errors.push('Transaction date is in the future');
      }
      if ((now.getTime() - txDate.getTime()) > (365 * 24 * 60 * 60 * 1000)) {
        errors.push('Transaction is over a year old');
      }
    }

    // Amount validation
    if (typeof transaction.amount !== 'number' || isNaN(transaction.amount)) {
      errors.push('Invalid amount format');
    } else if (transaction.amount === 0) {
      errors.push('Zero amount transaction');
    }

    // Description validation
    if (!transaction.description?.trim()) {
      errors.push('Missing description');
    } else if (!bankFormat.patterns.merchantCodes.test(transaction.description)) {
      errors.push('Description missing expected transaction codes');
    }

    return errors;
  }

  // ... rest of implementation
}

export const bankStatementParser = new BankStatementParser(); 