'use client';

import { 
  BankTransaction, 
  Expense, 
  OCRResult, 
  ProcessedReceipt,
  ReceiptMatch,
  ValidationIssue 
} from '@/types';

// Type Guards
export function isBankTransaction(obj: any): obj is BankTransaction {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    obj.date instanceof Date &&
    typeof obj.description === 'string' &&
    typeof obj.amount === 'number' &&
    typeof obj.type === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.status === 'string'
  );
}

export function isExpense(obj: any): obj is Expense {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.date === 'string' &&
    typeof obj.merchant === 'string' &&
    typeof obj.amount === 'number' &&
    typeof obj.hasReceipt === 'boolean' &&
    (obj.type === 'personal' || obj.type === 'business')
  );
}

export function isOCRResult(obj: any): obj is OCRResult {
  return (
    typeof obj === 'object' &&
    typeof obj.merchant === 'string' &&
    typeof obj.date === 'string' &&
    typeof obj.total === 'number' &&
    typeof obj.confidence === 'number' &&
    (!obj.items || Array.isArray(obj.items))
  );
}

export function isProcessedReceipt(obj: any): obj is ProcessedReceipt {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.originalSource === 'object' &&
    typeof obj.backupUrl === 'string' &&
    isOCRResult(obj.ocrData) &&
    ['pending', 'matched', 'unmatched', 'error'].includes(obj.status) &&
    obj.processedAt instanceof Date
  );
}

export function isReceiptMatch(obj: any): obj is ReceiptMatch {
  return (
    typeof obj === 'object' &&
    isProcessedReceipt(obj.receipt) &&
    isBankTransaction(obj.transaction) &&
    typeof obj.confidence === 'number'
  );
}

// Validation Functions
export function validateBankTransaction(tx: Partial<BankTransaction>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!tx.id) {
    issues.push({ field: 'id', message: 'ID is required' });
  }
  if (!(tx.date instanceof Date)) {
    issues.push({ field: 'date', message: 'Valid date is required' });
  }
  if (!tx.description) {
    issues.push({ field: 'description', message: 'Description is required' });
  }
  if (typeof tx.amount !== 'number') {
    issues.push({ field: 'amount', message: 'Valid amount is required' });
  }
  if (!tx.type) {
    issues.push({ field: 'type', message: 'Type is required' });
  }
  if (!tx.category) {
    issues.push({ field: 'category', message: 'Category is required' });
  }
  if (!tx.status) {
    issues.push({ field: 'status', message: 'Status is required' });
  }

  return issues;
}

export function validateExpense(expense: Partial<Expense>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!expense.id) {
    issues.push({ field: 'id', message: 'ID is required' });
  }
  if (!expense.date) {
    issues.push({ field: 'date', message: 'Date is required' });
  }
  if (!expense.merchant) {
    issues.push({ field: 'merchant', message: 'Merchant is required' });
  }
  if (typeof expense.amount !== 'number') {
    issues.push({ field: 'amount', message: 'Valid amount is required' });
  }
  if (typeof expense.hasReceipt !== 'boolean') {
    issues.push({ field: 'hasReceipt', message: 'Receipt status is required' });
  }
  if (!['personal', 'business'].includes(expense.type as string)) {
    issues.push({ field: 'type', message: 'Valid type is required' });
  }

  return issues;
}

export function validateOCRResult(result: Partial<OCRResult>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!result.merchant) {
    issues.push({ field: 'merchant', message: 'Merchant is required' });
  }
  if (!result.date) {
    issues.push({ field: 'date', message: 'Date is required' });
  }
  if (typeof result.total !== 'number') {
    issues.push({ field: 'total', message: 'Valid total is required' });
  }
  if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
    issues.push({ field: 'confidence', message: 'Valid confidence score is required' });
  }

  if (result.items) {
    if (!Array.isArray(result.items)) {
      issues.push({ field: 'items', message: 'Items must be an array' });
    } else {
      result.items.forEach((item, index) => {
        if (!item.description) {
          issues.push({ field: `items[${index}].description`, message: 'Item description is required' });
        }
        if (typeof item.amount !== 'number') {
          issues.push({ field: `items[${index}].amount`, message: 'Valid item amount is required' });
        }
      });
    }
  }

  return issues;
}

// Helper Functions
export function assertBankTransaction(obj: any): asserts obj is BankTransaction {
  if (!isBankTransaction(obj)) {
    throw new Error('Invalid bank transaction');
  }
}

export function assertExpense(obj: any): asserts obj is Expense {
  if (!isExpense(obj)) {
    throw new Error('Invalid expense');
  }
}

export function assertOCRResult(obj: any): asserts obj is OCRResult {
  if (!isOCRResult(obj)) {
    throw new Error('Invalid OCR result');
  }
}

export function assertProcessedReceipt(obj: any): asserts obj is ProcessedReceipt {
  if (!isProcessedReceipt(obj)) {
    throw new Error('Invalid processed receipt');
  }
}

export function assertReceiptMatch(obj: any): asserts obj is ReceiptMatch {
  if (!isReceiptMatch(obj)) {
    throw new Error('Invalid receipt match');
  }
} 