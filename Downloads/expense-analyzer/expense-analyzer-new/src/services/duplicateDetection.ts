'use client';

import { Expense, BankTransaction, CashExpense } from '@/types';
import { compareTwoStrings } from 'string-similarity';
import { MERCHANT_PATTERNS } from './patterns';
import { formatDate, getDaysBetween } from '@/utils/dateUtils';
import { parseCurrency } from '@/utils/bankCSVParser';
import { loadPersonalTransactions, loadBankTransactions, savePersonalTransactions } from '@/utils/storage';
import { needsReceipt, getReceiptStatus } from '@/utils/receiptUtils';

interface MatchConfig {
  dateToleranceDays: number;
  amountTolerance: number;
  descriptionSimilarity: number;
  merchantSimilarity: number;
  confidenceThreshold: number;
  recurringPatterns?: {
    interval: number;
    tolerance: number;
    minOccurrences: number;
  };
  splitPatterns?: {
    maxParts: number;
    tolerance: number;
  };
  receiptMatching?: {
    requireExactMatch: boolean;
    allowPartialMatch: boolean;
    minConfidence: number;
    maxDateDifference: number;
  };
  validation?: {
    requireReceipts: boolean;
    allowMissingReceipts: boolean;
    validateAmounts: boolean;
    validateDates: boolean;
  };
}

export interface DuplicateGroup {
  items: (Expense | BankTransaction | CashExpense)[];
  confidence: number;
  reasons: string[];
  metadata: {
    dateRange: { start: string; end: string };
    totalAmount: number;
    merchants: string[];
    categories: string[];
    patterns: string[];
  };
}

interface MatchResult {
  isDuplicate: boolean;
  confidence: number;
  matchReasons: string[];
  metadata?: {
    dateDifference?: number;
    amountDifference?: number;
    descriptionSimilarity?: number;
    merchantSimilarity?: number;
    patterns?: string[];
  };
}

const ENHANCED_CONFIG: MatchConfig = {
  dateToleranceDays: 3,
  amountTolerance: 0.01, // 1% difference
  descriptionSimilarity: 0.8,
  merchantSimilarity: 0.85,
  confidenceThreshold: 0.7,
  recurringPatterns: {
    interval: 30, // days
    tolerance: 2, // days
    minOccurrences: 2
  },
  splitPatterns: {
    maxParts: 5,
    tolerance: 0.01 // 1%
  },
  receiptMatching: {
    requireExactMatch: false,
    allowPartialMatch: true,
    minConfidence: 0.8,
    maxDateDifference: 7 // days
  },
  validation: {
    requireReceipts: true,
    allowMissingReceipts: false,
    validateAmounts: true,
    validateDates: true
  }
};

export class DuplicateDetector {
  private config: MatchConfig;
  private transactionHistory: Map<string, (Expense | BankTransaction | CashExpense)[]>;

  constructor(config: Partial<MatchConfig> = {}) {
    this.config = { ...ENHANCED_CONFIG, ...config };
    this.transactionHistory = new Map();
    this.loadTransactionHistory();
  }

  private async loadTransactionHistory() {
    const personalTx = loadPersonalTransactions();
    const bankTx = loadBankTransactions();
    
    // Group by merchant for faster lookup
    [...personalTx, ...bankTx].forEach(tx => {
      const key = this.cleanMerchantName(tx.merchant || tx.description);
      const existing = this.transactionHistory.get(key) || [];
      existing.push(tx);
      this.transactionHistory.set(key, existing);
    });
  }

  findDuplicates(
    expenses: (Expense | BankTransaction | CashExpense)[]
  ): DuplicateGroup[] {
    const duplicateGroups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    expenses.forEach((expense1, i) => {
      if (processed.has(expense1.id)) return;

      const group: (Expense | BankTransaction | CashExpense)[] = [expense1];
      const reasons: string[] = [];
      let groupConfidence = 0;
      const metadata = this.initializeGroupMetadata(expense1);

      expenses.slice(i + 1).forEach(expense2 => {
        if (processed.has(expense2.id)) return;

        const { isDuplicate, confidence, matchReasons, metadata: matchMetadata } = 
          this.analyzePotentialDuplicate(expense1, expense2);
        
        if (isDuplicate) {
          group.push(expense2);
          reasons.push(...matchReasons);
          groupConfidence = Math.max(groupConfidence, confidence);
          this.updateGroupMetadata(metadata, expense2, matchMetadata);
          processed.add(expense2.id);
        }
      });

      if (group.length > 1) {
        duplicateGroups.push({
          items: group,
          confidence: groupConfidence,
          reasons: [...new Set(reasons)],
          metadata
        });
        processed.add(expense1.id);
      }
    });

    return this.rankAndFilterGroups(duplicateGroups);
  }

  private analyzePotentialDuplicate(
    expense1: Expense | BankTransaction | CashExpense,
    expense2: Expense | BankTransaction | CashExpense
  ): MatchResult {
    const reasons: string[] = [];
    let totalConfidence = 0;
    let weightSum = 0;

    // Date comparison
    const daysDiff = Math.abs(
      getDaysBetween(expense1.date, expense2.date)
    );
    
    if (daysDiff === 0) {
      reasons.push('Exact date match');
      totalConfidence += 1 * 0.3; // 30% weight for date
    } else if (daysDiff <= this.config.dateToleranceDays) {
      reasons.push(`Dates within ${daysDiff} days`);
      totalConfidence += (1 - daysDiff / this.config.dateToleranceDays) * 0.3;
    }
    weightSum += 0.3;

    // Amount comparison
    const amount1 = Math.abs(expense1.amount);
    const amount2 = Math.abs(expense2.amount);
    const amountDiff = Math.abs(amount1 - amount2) / Math.max(amount1, amount2);
    
    if (amountDiff === 0) {
      reasons.push('Exact amount match');
      totalConfidence += 1 * 0.4; // 40% weight for amount
    } else if (amountDiff <= this.config.amountTolerance) {
      reasons.push(`Amounts differ by ${(amountDiff * 100).toFixed(2)}%`);
      totalConfidence += (1 - amountDiff / this.config.amountTolerance) * 0.4;
    }
    weightSum += 0.4;

    // Merchant/Description comparison
    const merchant1 = this.cleanMerchantName(expense1.merchant || expense1.description);
    const merchant2 = this.cleanMerchantName(expense2.merchant || expense2.description);
    const merchantSimilarity = compareTwoStrings(merchant1, merchant2);

    if (merchantSimilarity >= this.config.merchantSimilarity) {
      reasons.push(`Similar merchant names (${(merchantSimilarity * 100).toFixed(1)}% match)`);
      totalConfidence += merchantSimilarity * 0.3; // 30% weight for merchant
    }
    weightSum += 0.3;

    const confidence = totalConfidence / weightSum;
    const isDuplicate = confidence >= this.config.confidenceThreshold;

    return {
      isDuplicate,
      confidence,
      matchReasons: reasons,
      metadata: {
        dateDifference: daysDiff,
        amountDifference: amountDiff,
        merchantSimilarity,
        patterns: this.detectCommonPatterns(expense1, expense2)
      }
    };
  }

  private cleanMerchantName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\b(inc|llc|ltd|corp|co|company)\b/g, '')
      .replace(/\b(restaurant|store|shop|market)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private detectCommonPatterns(
    expense1: Expense | BankTransaction | CashExpense,
    expense2: Expense | BankTransaction | CashExpense
  ): string[] {
    const patterns: string[] = [];
    const merchant = this.cleanMerchantName(expense1.merchant || expense1.description);
    const merchantHistory = this.transactionHistory.get(merchant) || [];
    
    // Recurring payment detection
    if (expense1.amount === expense2.amount) {
      const { interval, tolerance, minOccurrences } = this.config.recurringPatterns!;
      const similarAmounts = merchantHistory.filter(tx => 
        Math.abs(tx.amount - expense1.amount) < this.config.amountTolerance * expense1.amount
      );

      if (similarAmounts.length >= minOccurrences) {
        const intervals = similarAmounts.map(tx => 
          Math.abs(getDaysBetween(tx.date, expense1.date))
        );

        const isRecurring = intervals.some(i => 
          Math.abs(i % interval) <= tolerance
        );

        if (isRecurring) {
          patterns.push('recurring_payment');
          patterns.push(`recurring_${interval}_days`);
        }
      }
    }

    // Split payment detection
    const { maxParts, tolerance } = this.config.splitPatterns!;
    const recentTransactions = merchantHistory
      .filter(tx => 
        getDaysBetween(tx.date, expense1.date) <= 7
      )
      .sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

    if (recentTransactions.length > 1 && recentTransactions.length <= maxParts) {
      const totalAmount = recentTransactions.reduce((sum, tx) => 
        sum + Math.abs(tx.amount), 0
      );

      if (Math.abs(Math.round(totalAmount) - totalAmount) <= tolerance) {
        patterns.push('split_payment');
        patterns.push(`split_${recentTransactions.length}_parts`);
      }
    }

    // Tax and tip patterns
    const commonTaxRates = [0.0625, 0.07, 0.0825, 0.0925, 0.10];
    const commonTipRates = [0.15, 0.18, 0.20, 0.25];

    const amount1 = Math.abs(expense1.amount);
    const amount2 = Math.abs(expense2.amount);

    // Check if one amount could be base + tax
    commonTaxRates.forEach(rate => {
      const baseAmount = amount1 / (1 + rate);
      if (Math.abs(baseAmount - amount2) < tolerance) {
        patterns.push('tax_pair');
        patterns.push(`tax_rate_${(rate * 100).toFixed(2)}`);
      }
    });

    // Check if one amount could be base + tip
    commonTipRates.forEach(rate => {
      const baseAmount = amount1 / (1 + rate);
      if (Math.abs(baseAmount - amount2) < tolerance) {
        patterns.push('tip_pair');
        patterns.push(`tip_rate_${(rate * 100).toFixed(0)}`);
      }
    });

    return [...new Set(patterns)];
  }

  private rankAndFilterGroups(groups: DuplicateGroup[]): DuplicateGroup[] {
    return groups
      .sort((a, b) => b.confidence - a.confidence)
      .filter(group => group.confidence >= this.config.confidenceThreshold);
  }

  // Helper methods for metadata management
  private initializeGroupMetadata(expense: Expense | BankTransaction | CashExpense) {
    return {
      dateRange: { 
        start: expense.date, 
        end: expense.date 
      },
      totalAmount: Math.abs(expense.amount),
      merchants: [expense.merchant || expense.description],
      categories: [expense.category].filter(Boolean),
      patterns: []
    };
  }

  private updateGroupMetadata(
    metadata: DuplicateGroup['metadata'],
    expense: Expense | BankTransaction | CashExpense,
    matchMetadata?: MatchResult['metadata']
  ) {
    metadata.dateRange.start = formatDate(Math.min(
      new Date(metadata.dateRange.start).getTime(),
      new Date(expense.date).getTime()
    ));
    metadata.dateRange.end = formatDate(Math.max(
      new Date(metadata.dateRange.end).getTime(),
      new Date(expense.date).getTime()
    ));
    metadata.totalAmount += Math.abs(expense.amount);
    if (expense.merchant) metadata.merchants.push(expense.merchant);
    if (expense.category) metadata.categories.push(expense.category);
    if (matchMetadata?.patterns) metadata.patterns.push(...matchMetadata.patterns);
  }

  // Add new utility methods
  public getRecurringExpenses(): DuplicateGroup[] {
    return this.findDuplicates(Array.from(this.transactionHistory.values()).flat())
      .filter(group => 
        group.metadata.patterns.some(p => p.startsWith('recurring_'))
      );
  }

  public getSplitExpenses(): DuplicateGroup[] {
    return this.findDuplicates(Array.from(this.transactionHistory.values()).flat())
      .filter(group => 
        group.metadata.patterns.some(p => p.startsWith('split_'))
      );
  }

  public getMerchantDuplicates(merchantName: string): DuplicateGroup[] {
    const key = this.cleanMerchantName(merchantName);
    const transactions = this.transactionHistory.get(key) || [];
    return this.findDuplicates(transactions);
  }

  private async validateGroup(group: DuplicateGroup): Promise<string[]> {
    const warnings: string[] = [];
    
    // Receipt validation
    if (this.config.validation?.requireReceipts) {
      const missingReceipts = group.items.filter(item => 
        needsReceipt(item as BankTransaction) && !item.hasReceipt
      );

      if (missingReceipts.length > 0) {
        warnings.push(`Missing receipts for ${missingReceipts.length} transactions`);
      }
    }

    // Amount validation
    if (this.config.validation?.validateAmounts) {
      const amounts = group.items.map(item => Math.abs(item.amount));
      const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
      const averageAmount = totalAmount / amounts.length;
      
      const hasOutliers = amounts.some(amount => 
        Math.abs(amount - averageAmount) / averageAmount > this.config.amountTolerance
      );

      if (hasOutliers) {
        warnings.push('Group contains transactions with significantly different amounts');
      }
    }

    // Date validation
    if (this.config.validation?.validateDates) {
      const dates = group.items.map(item => new Date(item.date).getTime());
      const dateRange = Math.max(...dates) - Math.min(...dates);
      const daysDiff = dateRange / (1000 * 60 * 60 * 24);

      if (daysDiff > this.config.dateToleranceDays) {
        warnings.push(`Transactions span ${Math.round(daysDiff)} days`);
      }
    }

    return warnings;
  }

  private async matchReceipts(
    group: DuplicateGroup
  ): Promise<{ matches: Array<{ transaction: BankTransaction; receiptUrl: string }>; confidence: number }> {
    const matches: Array<{ transaction: BankTransaction; receiptUrl: string }> = [];
    let totalConfidence = 0;

    for (const item of group.items) {
      if ('hasReceipt' in item && item.hasReceipt && item.receiptUrl) {
        const tx = item as BankTransaction;
        
        // Check for exact matches
        const exactMatch = group.items.find(other => 
          other !== item &&
          'amount' in other &&
          Math.abs(other.amount - tx.amount) < 0.01 &&
          getDaysBetween(other.date, tx.date) <= this.config.receiptMatching!.maxDateDifference
        );

        if (exactMatch) {
          matches.push({
            transaction: tx,
            receiptUrl: tx.receiptUrl!
          });
          totalConfidence += 1;
          continue;
        }

        // Check for partial matches if allowed
        if (this.config.receiptMatching?.allowPartialMatch) {
          const partialMatches = group.items.filter(other => 
            other !== item &&
            'amount' in other &&
            this.isPartialMatch(tx, other)
          );

          if (partialMatches.length > 0) {
            matches.push({
              transaction: tx,
              receiptUrl: tx.receiptUrl!
            });
            totalConfidence += 0.8; // Lower confidence for partial matches
          }
        }
      }
    }

    return {
      matches,
      confidence: matches.length > 0 ? totalConfidence / matches.length : 0
    };
  }

  private isPartialMatch(
    tx: BankTransaction,
    other: Expense | BankTransaction | CashExpense
  ): boolean {
    // Amount is part of total
    const isPartOfTotal = Math.abs(tx.amount) > Math.abs(other.amount) &&
      Math.abs(tx.amount - other.amount) < this.config.amountTolerance * Math.abs(tx.amount);

    // Date is within range
    const isWithinDateRange = getDaysBetween(tx.date, other.date) <= 
      this.config.receiptMatching!.maxDateDifference;

    // Merchant names are similar
    const merchantSimilarity = compareTwoStrings(
      this.cleanMerchantName(tx.merchant || ''),
      this.cleanMerchantName(other.merchant || '')
    );

    return isPartOfTotal && 
           isWithinDateRange && 
           merchantSimilarity >= this.config.merchantSimilarity;
  }

  // Add new utility methods
  public async validateDuplicateGroups(
    groups: DuplicateGroup[]
  ): Promise<Array<DuplicateGroup & { warnings: string[] }>> {
    return Promise.all(
      groups.map(async group => ({
        ...group,
        warnings: await this.validateGroup(group)
      }))
    );
  }

  public async findMissingReceipts(): Promise<BankTransaction[]> {
    const allTransactions = Array.from(this.transactionHistory.values()).flat();
    return allTransactions.filter(tx => 
      'hasReceipt' in tx && needsReceipt(tx as BankTransaction)
    ) as BankTransaction[];
  }

  public async matchReceiptsToTransactions(
    group: DuplicateGroup
  ): Promise<Array<{ transaction: BankTransaction; receiptUrl: string; confidence: number }>> {
    const { matches, confidence } = await this.matchReceipts(group);
    return matches.map(match => ({
      ...match,
      confidence
    }));
  }
}

export const duplicateDetector = new DuplicateDetector(); 