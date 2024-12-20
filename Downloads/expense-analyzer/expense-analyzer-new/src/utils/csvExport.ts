'use client';

import Papa from 'papaparse';
import { ChaseTransaction } from '@/types';
import { formatDateDisplay } from '@/utils/dates';
import { formatCurrency } from '@/utils/currency';
import { getCategoryDescription } from '@/config/categories';

type ExportFormat = 'standard' | 'quickbooks' | 'xero' | 'expensify' | 'custom';

interface ExportOptions {
  format?: ExportFormat;
  includeMetadata?: boolean;
  dateFormat?: string;
  customFields?: string[];
  fileName?: string;
  groupBy?: 'category' | 'month' | 'merchant';
  filter?: (transaction: ChaseTransaction) => boolean;
  transform?: (transaction: ChaseTransaction) => Record<string, any>;
}

class CSVExportError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'CSVExportError';
  }
}

export async function exportTransactionsToCSV(
  transactions: ChaseTransaction[],
  options: ExportOptions = {}
): Promise<void> {
  const {
    format = 'standard',
    includeMetadata = false,
    fileName = `transactions-${formatDateDisplay(new Date())}`,
    filter,
    transform
  } = options;

  try {
    // Apply filters if provided
    let filteredTransactions = transactions;
    if (filter) {
      filteredTransactions = transactions.filter(filter);
    }

    // Transform data based on format
    const csvData = transformTransactionsForExport(
      filteredTransactions,
      format,
      includeMetadata,
      transform
    );

    // Generate CSV
    const csv = Papa.unparse(csvData, {
      quotes: true, // Always quote fields
      header: true,
      skipEmptyLines: true
    });

    // Download file
    downloadCSV(csv, `${fileName}.csv`);
  } catch (error) {
    throw new CSVExportError(
      'Failed to export transactions',
      'EXPORT_ERROR',
      error
    );
  }
}

function transformTransactionsForExport(
  transactions: ChaseTransaction[],
  format: ExportFormat,
  includeMetadata: boolean,
  customTransform?: (transaction: ChaseTransaction) => Record<string, any>
): Record<string, any>[] {
  if (customTransform) {
    return transactions.map(customTransform);
  }

  switch (format) {
    case 'standard':
      return transactions.map(tx => ({
        Date: formatDateDisplay(new Date(tx.date)),
        Description: tx.description,
        Amount: formatCurrency(tx.amount),
        Category: tx.category,
        Type: tx.type,
        Merchant: tx.merchant,
        'Has Receipt': tx.hasReceipt ? 'Yes' : 'No',
        ...(includeMetadata ? {
          'Receipt URL': tx.receiptUrl || '',
          'Notes': tx.notes || '',
          'Tags': Array.isArray(tx.tags) ? tx.tags.join(', ') : ''
        } : {})
      }));

    case 'quickbooks':
      return transactions.map(tx => ({
        Date: formatDateDisplay(new Date(tx.date)),
        Name: tx.merchant,
        Description: tx.description,
        Amount: formatCurrency(tx.amount),
        'Account Type': tx.type === 'debit' ? 'Expense' : 'Income',
        Category: getCategoryDescription(tx.category),
        'Class': tx.type === 'personal' ? 'Personal' : 'Business',
        'Payment Method': tx.metadata?.paymentMethod || '',
        'Tax Amount': tx.metadata?.taxAmount || '',
        'Has Receipt': tx.hasReceipt ? 'Yes' : 'No'
      }));

    case 'xero':
      return transactions.map(tx => ({
        'Date': formatDateDisplay(new Date(tx.date)),
        'Contact': tx.merchant,
        'Reference': tx.id,
        'Description': tx.description,
        'Amount': formatCurrency(tx.amount),
        'Tax Rate': tx.metadata?.taxRate || 'Tax Exempt',
        'Tax Amount': tx.metadata?.taxAmount || '0.00',
        'Account': tx.type === 'debit' ? 'Expenses' : 'Income',
        'Tracking Category 1': tx.category,
        'Tracking Option 1': tx.type
      }));

    case 'expensify':
      return transactions.map(tx => ({
        'Date': formatDateDisplay(new Date(tx.date)),
        'Merchant': tx.merchant,
        'Amount': formatCurrency(tx.amount),
        'Category': tx.category,
        'Description': tx.description,
        'Receipt': tx.receiptUrl || '',
        'Reimbursable': tx.type === 'business' ? 'Y' : 'N',
        'Payment Method': tx.metadata?.paymentMethod || '',
        'Tax Amount': tx.metadata?.taxAmount || '',
        'Tags': Array.isArray(tx.tags) ? tx.tags.join(', ') : '',
        'Report Name': tx.metadata?.reportName || '',
        'Employee Name': tx.metadata?.employeeName || '',
        'Employee Email': tx.metadata?.employeeEmail || ''
      }));

    default:
      throw new CSVExportError(
        `Unsupported export format: ${format}`,
        'UNSUPPORTED_FORMAT'
      );
  }
}

function downloadCSV(csv: string, fileName: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, fileName);
  } else {
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Helper function for grouping transactions
export function groupTransactions<T extends ChaseTransaction>(
  transactions: T[],
  groupBy: 'category' | 'month' | 'merchant'
): Record<string, T[]> {
  return transactions.reduce((groups, tx) => {
    let key: string;
    
    switch (groupBy) {
      case 'category':
        key = tx.category || 'Uncategorized';
        break;
      case 'month':
        key = formatDateDisplay(new Date(tx.date), 'MMMM yyyy');
        break;
      case 'merchant':
        key = tx.merchant || 'Unknown';
        break;
      default:
        key = 'default';
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(tx);
    return groups;
  }, {} as Record<string, T[]>);
}

// Usage example:
/*
await exportTransactionsToCSV(transactions, {
  format: 'quickbooks',
  includeMetadata: true,
  fileName: 'expenses-2024-q1',
  filter: tx => tx.type === 'business',
  groupBy: 'category'
});
*/ 