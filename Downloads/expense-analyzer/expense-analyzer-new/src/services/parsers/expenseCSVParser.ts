'use client';

import { BankTransaction, Expense } from '@/types';
import { isBusinessExpense } from '../categorization/merchantCategories';

interface CSVHeaders {
  date: string[];
  description: string[];
  amount: string[];
  category: string[];
  type: string[];
  notes: string[];
  receipt: string[];
  merchant: string[];
  reportStatus: string[];
  glCategory: string[];
  reportName: string[];
}

export const CSV_HEADERS: CSVHeaders = {
  date: ['Date', 'Transaction Date', 'Posted Date', 'Report Created Date'],
  description: ['Description', 'Merchant'],
  amount: ['Amount', 'Report Currency', 'Original Amount'],
  category: ['Category', 'GL Category', 'Tag1'],
  type: ['Transaction Type', 'Type'],
  notes: ['Description', 'Report Name', 'Report ID'],
  receipt: ['Receipt'],
  merchant: ['Merchant'],
  reportStatus: ['Report Status'],
  glCategory: ['GL Category'],
  reportName: ['Report Name']
};

export const CATEGORY_MAPPINGS: Record<string, string> = {
  'DH: Travel Costs - Gas/Rental Car': 'Travel & Transportation',
  'DH:  BD:  Client Business Meals': 'Business Meals',
  'Company Meetings and Meals': 'Business Meals',
  'Software subscriptions': 'Software & Services',
  'Conference': 'Events & Conferences',
  'BD: Advertising & Promotion': 'Marketing',
  'Travel Costs - Hotel': 'Travel & Transportation',
  'DH: Travel Costs - Cab/Uber/Bus Fare': 'Travel & Transportation'
};

const detectCSVFormat = (headers: string[]): 'expensify' | 'bank' => {
  const expensifyHeaders = ['Report Name', 'GL Category', 'Report Status'];
  return expensifyHeaders.some(h => headers.includes(h)) ? 'expensify' : 'bank';
};

const findHeaderValue = (row: Record<string, string>, headerOptions: string[]): string => {
  for (const header of headerOptions) {
    if (row[header]) return row[header];
  }
  return '';
};

const generateUniqueId = (prefix: string, index: number): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}-${timestamp}-${random}-${index}`;
};

const parseAmount = (amountStr: string): number => {
  const cleanAmount = amountStr.replace(/[$,]/g, '');
  return Math.abs(parseFloat(cleanAmount) || 0);
};

const determineExpenseType = (
  merchant: string, 
  description: string, 
  amount: number,
  glCategory?: string
): {
  isPersonal: boolean;
  isBusiness: boolean;
  category: string;
} => {
  // Check GL Category first
  if (glCategory && CATEGORY_MAPPINGS[glCategory]) {
    return {
      isPersonal: false,
      isBusiness: true,
      category: CATEGORY_MAPPINGS[glCategory]
    };
  }

  // Use merchant categorization service
  const isBusiness = isBusinessExpense(merchant, description);
  
  return {
    isPersonal: !isBusiness,
    isBusiness,
    category: isBusiness ? 'Business Expenses' : 'Personal'
  };
};

export const parseExpenseCSV = (csvContent: string): BankTransaction[] => {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const format = detectCSVFormat(headers);

  return lines.slice(1).reduce((transactions: BankTransaction[], line, index) => {
    if (!line.trim()) return transactions;

    // Handle quoted values containing commas
    const values = line.match(/(?:\"([^\"]*)\"|([^,]+))/g)?.map(val => 
      val.replace(/^"|"$/g, '').trim()
    ) || [];

    const row = headers.reduce((obj: Record<string, string>, header, index) => {
      obj[header.trim()] = values[index]?.trim() || '';
      return obj;
    }, {});

    const amount = parseAmount(findHeaderValue(row, CSV_HEADERS.amount));
    const merchant = findHeaderValue(row, CSV_HEADERS.merchant);
    const description = findHeaderValue(row, CSV_HEADERS.description);
    const glCategory = findHeaderValue(row, CSV_HEADERS.glCategory);
    const receiptUrl = findHeaderValue(row, CSV_HEADERS.receipt);

    const { isPersonal, isBusiness, category } = determineExpenseType(
      merchant,
      description,
      amount,
      glCategory
    );

    const transaction: BankTransaction = {
      id: generateUniqueId('tx', index),
      date: findHeaderValue(row, CSV_HEADERS.date),
      description,
      amount,
      type: 'debit',
      category,
      merchant,
      notes: findHeaderValue(row, CSV_HEADERS.notes),
      hasReceipt: !!receiptUrl,
      receiptUrl,
      isPersonal,
      isBusiness,
      isReconciled: false,
      reportStatus: findHeaderValue(row, CSV_HEADERS.reportStatus),
      reportName: findHeaderValue(row, CSV_HEADERS.reportName)
    };

    transactions.push(transaction);
    return transactions;
  }, []);
}; 