'use client';

import Papa from 'papaparse';
import { ChaseTransaction } from '@/types';
import { normalizeMerchantName } from '@/utils/merchantMatching';
import { Logger } from '@/utils/logger';
import { formatDateDisplay } from '@/utils/dates';

interface ExpensifyRow {
  // Core fields
  Date: string;
  Merchant: string;
  Amount: string;
  Description?: string;
  Category?: string;
  'GL Category'?: string;
  'Transaction Type'?: string;
  Receipt?: string;
  Reimbursable?: string;
  'Report ID'?: string;
  'Report Name'?: string;
  'Report Status'?: string;
  'Report Policy'?: string;
  'Employee Name'?: string;
  'Employee Email'?: string;
  'Employee Department'?: string;
  'Payment Method'?: string;
  'Tax Amount'?: string;
  'Tax Category'?: string;
  'Currency'?: string;
  'Exchange Rate'?: string;
  'Tags'?: string;
  'Custom Fields'?: string;
}

interface ExpensifyParseOptions {
  requireReceipts?: boolean;
  validateAmounts?: boolean;
  maxAmount?: number;
  allowedCategories?: string[];
  allowedPaymentMethods?: string[];
  requireEmployeeInfo?: boolean;
}

class ExpensifyParseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ExpensifyParseError';
  }
}

export async function parseExpensifyCSV(
  file: File,
  options: ExpensifyParseOptions = {}
): Promise<ChaseTransaction[]> {
  const {
    requireReceipts = false,
    validateAmounts = true,
    maxAmount = 10000,
    allowedCategories = [],
    allowedPaymentMethods = [],
    requireEmployeeInfo = false
  } = options;

  return new Promise((resolve, reject) => {
    Papa.parse<ExpensifyRow>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      complete: (result) => {
        try {
          validateExpensifyCSV(result.data);
          
          const transactions = result.data
            .map((row, index) => {
              try {
                return transformExpensifyRow(row, index, {
                  requireReceipts,
                  validateAmounts,
                  maxAmount,
                  allowedCategories,
                  allowedPaymentMethods,
                  requireEmployeeInfo
                });
              } catch (error) {
                Logger.warn('Failed to transform Expensify row', { error, row, index });
                return null;
              }
            })
            .filter((t): t is ChaseTransaction => t !== null);

          if (transactions.length === 0) {
            throw new ExpensifyParseError(
              'No valid transactions found',
              'NO_VALID_TRANSACTIONS'
            );
          }

          Logger.info('Successfully parsed Expensify CSV', {
            total: transactions.length,
            skipped: result.data.length - transactions.length
          });

          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(new ExpensifyParseError(
        'Failed to parse CSV',
        'PARSE_ERROR',
        error
      ))
    });
  });
}

function validateExpensifyCSV(data: ExpensifyRow[]): void {
  if (!data?.length) {
    throw new ExpensifyParseError('CSV file is empty', 'EMPTY_FILE');
  }

  const requiredColumns = ['Date', 'Merchant', 'Amount'];
  const missingColumns = requiredColumns.filter(col => 
    !Object.keys(data[0]).includes(col)
  );

  if (missingColumns.length) {
    throw new ExpensifyParseError(
      `Missing required columns: ${missingColumns.join(', ')}`,
      'MISSING_COLUMNS'
    );
  }
}

function transformExpensifyRow(
  row: ExpensifyRow,
  index: number,
  options: ExpensifyParseOptions
): ChaseTransaction | null {
  const {
    requireReceipts,
    validateAmounts,
    maxAmount,
    allowedCategories,
    allowedPaymentMethods,
    requireEmployeeInfo
  } = options;

  // Validate required fields
  if (requireReceipts && !row.Receipt) {
    throw new ExpensifyParseError(
      'Receipt required but missing',
      'MISSING_RECEIPT'
    );
  }

  if (requireEmployeeInfo && (!row['Employee Name'] || !row['Employee Email'])) {
    throw new ExpensifyParseError(
      'Employee information required but missing',
      'MISSING_EMPLOYEE_INFO'
    );
  }

  // Parse and validate amount
  const amount = parseAmount(row.Amount, row.Currency);
  if (validateAmounts) {
    if (isNaN(amount)) {
      throw new ExpensifyParseError(
        'Invalid amount',
        'INVALID_AMOUNT',
        { amount: row.Amount }
      );
    }
    if (Math.abs(amount) > maxAmount) {
      throw new ExpensifyParseError(
        'Amount exceeds maximum',
        'AMOUNT_TOO_HIGH',
        { amount, maxAmount }
      );
    }
  }

  // Validate category if specified
  if (allowedCategories.length > 0 && !allowedCategories.includes(row.Category || '')) {
    throw new ExpensifyParseError(
      'Invalid category',
      'INVALID_CATEGORY',
      { category: row.Category, allowed: allowedCategories }
    );
  }

  // Validate payment method if specified
  if (allowedPaymentMethods.length > 0 && !allowedPaymentMethods.includes(row['Payment Method'] || '')) {
    throw new ExpensifyParseError(
      'Invalid payment method',
      'INVALID_PAYMENT_METHOD',
      { method: row['Payment Method'], allowed: allowedPaymentMethods }
    );
  }

  // Parse custom fields
  const customFields = parseCustomFields(row['Custom Fields'] || '');

  // Create transaction
  return {
    id: `exp-${Date.now()}-${index}`,
    date: formatDateDisplay(new Date(row.Date)),
    description: cleanDescription(row.Description || row.Merchant),
    amount: Math.abs(amount),
    type: 'debit',
    category: row.Category || row['GL Category'],
    merchant: normalizeMerchantName(row.Merchant)[0],
    source: 'expensify',
    receipt: row.Receipt,
    reimbursable: row.Reimbursable?.toLowerCase() === 'y',
    reportId: row['Report ID'],
    metadata: {
      reportName: row['Report Name'],
      reportStatus: row['Report Status'],
      reportPolicy: row['Report Policy'],
      employeeName: row['Employee Name'],
      employeeEmail: row['Employee Email'],
      employeeDepartment: row['Employee Department'],
      paymentMethod: row['Payment Method'],
      taxAmount: row['Tax Amount'],
      taxCategory: row['Tax Category'],
      currency: row.Currency,
      exchangeRate: row['Exchange Rate'],
      tags: row.Tags?.split(',').map(tag => tag.trim()),
      customFields
    }
  };
}

function parseAmount(amount: string, currency?: string): number {
  const cleanAmount = amount
    .replace(/[,$\s]/g, '')
    .replace(/−/g, '-')
    .trim();
    
  const parsedAmount = parseFloat(cleanAmount);

  // Handle currency conversion if needed
  if (currency && currency !== 'USD') {
    // TODO: Implement currency conversion
    Logger.warn('Currency conversion not implemented', { currency });
  }

  return parsedAmount;
}

function parseCustomFields(customFieldsStr: string): Record<string, string> {
  if (!customFieldsStr) return {};

  try {
    return customFieldsStr.split(';').reduce((acc, field) => {
      const [key, value] = field.split(':').map(s => s.trim());
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);
  } catch (error) {
    Logger.warn('Failed to parse custom fields', { error, customFieldsStr });
    return {};
  }
}

function cleanDescription(desc: string): string {
  return desc
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s&@.,\-$]/g, '')
    .trim();
} 