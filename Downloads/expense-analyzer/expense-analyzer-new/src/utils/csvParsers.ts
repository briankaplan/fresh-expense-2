'use client';

import Papa from 'papaparse';
import { ChaseTransaction } from '@/types';
import { areMerchantsRelated, normalizeMerchantName } from '@/utils/merchantMatching';
import { Logger } from '@/utils/logger';

// Type definitions
interface ExpensifyRow {
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
  'Long Report ID'?: string;
  'Bank'?: string;
  'Card Details'?: string;
}

interface ChaseRow {
  'Transaction Date': string;
  'Post Date'?: string;
  Description: string;
  Amount: string;
  'Expenses Amount'?: string;
  Category?: string;
  Type?: string;
}

interface AmexRow {
  'Date': string;
  'Description': string;
  'Amount': string;
  'Extended Details': string;
  'Appears On Your Statement As': string;
  'Address': string;
  'Category': string;
}

interface VisaRow {
  'Transaction Date': string;
  'Posted Date': string;
  'Card No.': string;
  'Description': string;
  'Category': string;
  'Debit': string;
  'Credit': string;
}

interface CitiRow {
  'Status': string;
  'Date': string;
  'Description': string;
  'Debit': string;
  'Credit': string;
  'Member Name': string;
}

interface QuickbooksRow {
  'Date': string;
  'Payee': string;
  'Memo/Description': string;
  'Amount': string;
  'Account': string;
  'Class': string;
  'Split': string;
}

interface XeroRow {
  'Date': string;
  'Contact': string;
  'Reference': string;
  'Description': string;
  'Amount': string;
  'Tax Rate': string;
  'Tax Amount': string;
  'Account': string;
}

class CSVParseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'CSVParseError';
  }
}

// Helper functions with better error handling
function formatDate(dateStr: string): string {
  try {
    if (!dateStr?.trim()) {
      throw new CSVParseError('Date is empty', 'EMPTY_DATE');
    }
    
    // Handle various date formats
    const formats = [
      // MM/DD/YY
      {
        regex: /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,
        transform: (m: RegExpMatchArray) => `20${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`
      },
      // MM/DD/YYYY
      {
        regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
        transform: (m: RegExpMatchArray) => `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`
      },
      // YYYY-MM-DD
      {
        regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
        transform: (m: RegExpMatchArray) => `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
      }
    ];

    for (const format of formats) {
      const match = dateStr.match(format.regex);
      if (match) {
        return format.transform(match);
      }
    }
    
    throw new CSVParseError(
      `Invalid date format: ${dateStr}`,
      'INVALID_DATE_FORMAT'
    );
  } catch (error) {
    Logger.error('Date parsing error', { error, dateStr });
    throw error;
  }
}

function cleanDescription(desc: string): string {
  if (!desc) return '';
  
  return desc
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s&@.,\-$]/g, '') // Remove special chars except common ones
    .trim();
}

function parseAmount(amountStr: string): number {
  try {
    if (!amountStr?.trim()) {
      throw new CSVParseError('Amount is empty', 'EMPTY_AMOUNT');
    }
    
    const cleanAmount = amountStr
      .replace(/[,$\s]/g, '')
      .replace(/−/g, '-') // Handle various minus signs
      .trim();
    
    const amount = parseFloat(cleanAmount);
    
    if (isNaN(amount)) {
      throw new CSVParseError(
        `Invalid amount: ${amountStr}`,
        'INVALID_AMOUNT'
      );
    }

    // Validate amount range
    if (Math.abs(amount) > 1000000) {
      throw new CSVParseError(
        'Amount exceeds maximum value',
        'AMOUNT_OUT_OF_RANGE'
      );
    }

    return amount;
  } catch (error) {
    Logger.error('Amount parsing error', { error, amountStr });
    throw error;
  }
}

// CSV Parsers with validation and logging
export async function parseChaseCSV(file: File): Promise<ChaseTransaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<ChaseRow>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      complete: (result) => {
        try {
          validateChaseCSV(result.data);
          
          const transactions = result.data
            .map((row, index) => {
              try {
                return transformChaseRow(row, index);
              } catch (error) {
                Logger.warn('Skipping invalid row', { error, row, index });
                return null;
              }
            })
            .filter((t): t is ChaseTransaction => t !== null);

          if (transactions.length === 0) {
            throw new CSVParseError(
              'No valid transactions found',
              'NO_VALID_TRANSACTIONS'
            );
          }

          Logger.info('Successfully parsed Chase CSV', {
            total: transactions.length,
            skipped: result.data.length - transactions.length
          });

          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(new CSVParseError(
        'Failed to parse CSV',
        'PARSE_ERROR',
        error
      ))
    });
  });
}

export async function parseExpensifyCSV(file: File): Promise<ChaseTransaction[]> {
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
                return transformExpensifyRow(row, index);
              } catch (error) {
                Logger.warn('Skipping invalid row', { error, row, index });
                return null;
              }
            })
            .filter((t): t is ChaseTransaction => t !== null);

          if (transactions.length === 0) {
            throw new CSVParseError(
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
      error: (error) => reject(new CSVParseError(
        'Failed to parse CSV',
        'PARSE_ERROR',
        error
      ))
    });
  });
}

// Validation helpers
function validateChaseCSV(data: ChaseRow[]): void {
  if (!data?.length) {
    throw new CSVParseError('CSV file is empty', 'EMPTY_FILE');
  }

  const requiredColumns = ['Transaction Date', 'Description', 'Amount'];
  const missingColumns = requiredColumns.filter(col => 
    !Object.keys(data[0]).includes(col)
  );

  if (missingColumns.length) {
    throw new CSVParseError(
      `Missing required columns: ${missingColumns.join(', ')}`,
      'MISSING_COLUMNS'
    );
  }
}

function validateExpensifyCSV(data: ExpensifyRow[]): void {
  if (!data?.length) {
    throw new CSVParseError('CSV file is empty', 'EMPTY_FILE');
  }

  const requiredColumns = ['Date', 'Merchant', 'Amount'];
  const missingColumns = requiredColumns.filter(col => 
    !Object.keys(data[0]).includes(col)
  );

  if (missingColumns.length) {
    throw new CSVParseError(
      `Missing required columns: ${missingColumns.join(', ')}`,
      'MISSING_COLUMNS'
    );
  }
}

// Row transformation helpers
function transformChaseRow(row: ChaseRow, index: number): ChaseTransaction {
  const amount = parseAmount(row.Amount || row['Expenses Amount'] || '0');
  
  return {
    id: `chase-${Date.now()}-${index}`,
    date: formatDate(row['Transaction Date']),
    description: cleanDescription(row.Description),
    amount,
    type: amount < 0 ? 'debit' : 'credit',
    category: row.Category,
    merchant: normalizeMerchantName(row.Description)[0],
    source: 'chase'
  };
}

function transformExpensifyRow(row: ExpensifyRow, index: number): ChaseTransaction {
  const amount = parseAmount(row.Amount);
  
  return {
    id: `exp-${Date.now()}-${index}`,
    date: formatDate(row.Date),
    description: cleanDescription(row.Description || row.Merchant),
    amount: Math.abs(amount),
    type: 'debit',
    category: row.Category,
    merchant: normalizeMerchantName(row.Merchant)[0],
    source: 'expensify',
    receipt: row.Receipt,
    reimbursable: row.Reimbursable === 'Y',
    reportId: row['Report ID']
  };
}

// Add these new interfaces for different CSV formats
interface AmexRow {
  'Date': string;
  'Description': string;
  'Amount': string;
  'Extended Details': string;
  'Appears On Your Statement As': string;
  'Address': string;
  'Category': string;
}

interface VisaRow {
  'Transaction Date': string;
  'Posted Date': string;
  'Card No.': string;
  'Description': string;
  'Category': string;
  'Debit': string;
  'Credit': string;
}

interface CitiRow {
  'Status': string;
  'Date': string;
  'Description': string;
  'Debit': string;
  'Credit': string;
  'Member Name': string;
}

interface QuickbooksRow {
  'Date': string;
  'Payee': string;
  'Memo/Description': string;
  'Amount': string;
  'Account': string;
  'Class': string;
  'Split': string;
}

interface XeroRow {
  'Date': string;
  'Contact': string;
  'Reference': string;
  'Description': string;
  'Amount': string;
  'Tax Rate': string;
  'Tax Amount': string;
  'Account': string;
}

// Add new parser functions
export async function parseAmexCSV(file: File): Promise<ChaseTransaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<AmexRow>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      complete: (result) => {
        try {
          validateCSV(result.data, ['Date', 'Description', 'Amount']);
          
          const transactions = result.data
            .map((row, index) => transformAmexRow(row, index))
            .filter((t): t is ChaseTransaction => t !== null);

          validateTransactions(transactions);
          Logger.info('Successfully parsed Amex CSV', {
            total: transactions.length,
            skipped: result.data.length - transactions.length
          });

          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      },
      error: handleParseError
    });
  });
}

export async function parseVisaCSV(file: File): Promise<ChaseTransaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<VisaRow>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      complete: (result) => {
        try {
          validateCSV(result.data, ['Transaction Date', 'Description', 'Debit', 'Credit']);
          
          const transactions = result.data
            .map((row, index) => transformVisaRow(row, index))
            .filter((t): t is ChaseTransaction => t !== null);

          validateTransactions(transactions);
          Logger.info('Successfully parsed Visa CSV', {
            total: transactions.length,
            skipped: result.data.length - transactions.length
          });

          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      },
      error: handleParseError
    });
  });
}

// Add transformation functions for each format
function transformAmexRow(row: AmexRow, index: number): ChaseTransaction | null {
  try {
    const amount = parseAmount(row.Amount);
    
    return {
      id: `amex-${Date.now()}-${index}`,
      date: formatDate(row.Date),
      description: cleanDescription(row.Description),
      amount: Math.abs(amount),
      type: amount < 0 ? 'debit' : 'credit',
      category: row.Category,
      merchant: normalizeMerchantName(row['Appears On Your Statement As'] || row.Description)[0],
      source: 'amex',
      metadata: {
        extendedDetails: row['Extended Details'],
        address: row.Address
      }
    };
  } catch (error) {
    Logger.warn('Failed to transform Amex row', { error, row, index });
    return null;
  }
}

function transformVisaRow(row: VisaRow, index: number): ChaseTransaction | null {
  try {
    const amount = parseAmount(row.Debit || row.Credit);
    
    return {
      id: `visa-${Date.now()}-${index}`,
      date: formatDate(row['Transaction Date']),
      description: cleanDescription(row.Description),
      amount: Math.abs(amount),
      type: row.Debit ? 'debit' : 'credit',
      category: row.Category,
      merchant: normalizeMerchantName(row.Description)[0],
      source: 'visa',
      metadata: {
        cardNumber: row['Card No.'],
        postedDate: row['Posted Date']
      }
    };
  } catch (error) {
    Logger.warn('Failed to transform Visa row', { error, row, index });
    return null;
  }
}

// Add generic validation function
function validateCSV<T>(data: T[], requiredColumns: string[]): void {
  if (!data?.length) {
    throw new CSVParseError('CSV file is empty', 'EMPTY_FILE');
  }

  const missingColumns = requiredColumns.filter(col => 
    !Object.keys(data[0]).includes(col)
  );

  if (missingColumns.length) {
    throw new CSVParseError(
      `Missing required columns: ${missingColumns.join(', ')}`,
      'MISSING_COLUMNS'
    );
  }
}

function validateTransactions(transactions: ChaseTransaction[]): void {
  if (transactions.length === 0) {
    throw new CSVParseError(
      'No valid transactions found',
      'NO_VALID_TRANSACTIONS'
    );
  }
}

function handleParseError(error: Error) {
  return new CSVParseError(
    'Failed to parse CSV',
    'PARSE_ERROR',
    error
  );
}

// Add a generic CSV parser that attempts to detect the format
export async function parseCSV(file: File): Promise<ChaseTransaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      preview: 1, // Look at first row only for detection
      complete: async (preview) => {
        try {
          const format = detectCSVFormat(Object.keys(preview.data[0]));
          
          switch (format) {
            case 'chase':
              return resolve(await parseChaseCSV(file));
            case 'amex':
              return resolve(await parseAmexCSV(file));
            case 'visa':
              return resolve(await parseVisaCSV(file));
            case 'expensify':
              return resolve(await parseExpensifyCSV(file));
            default:
              throw new CSVParseError(
                'Unrecognized CSV format',
                'UNKNOWN_FORMAT'
              );
          }
        } catch (error) {
          reject(error);
        }
      },
      error: handleParseError
    });
  });
}

function detectCSVFormat(headers: string[]): string | null {
  const headerSet = new Set(headers);

  if (headerSet.has('Transaction Date') && headerSet.has('Post Date')) {
    return 'chase';
  }
  if (headerSet.has('Extended Details') && headerSet.has('Appears On Your Statement As')) {
    return 'amex';
  }
  if (headerSet.has('Card No.') && headerSet.has('Posted Date')) {
    return 'visa';
  }
  if (headerSet.has('Merchant') && headerSet.has('Report ID')) {
    return 'expensify';
  }

  return null;
} 