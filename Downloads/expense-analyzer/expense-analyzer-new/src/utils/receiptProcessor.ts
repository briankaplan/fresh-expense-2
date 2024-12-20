'use client';

import { Dropbox } from 'dropbox';
import { ChaseTransaction, Expense } from '@/types';
import { Logger } from '@/utils/logger';
import { processReceipt } from '@/lib/mindee';
import { matchReceiptToTransaction } from '@/utils/expenseMatching';
import { formatDateDisplay } from '@/utils/dates';

interface AutomatedReceiptConfig {
  dropboxConfig: {
    appKey: string;
    appSecret: string;
    accessToken: string;
    watchFolder: string;
    backupFolder: string;
  };
  notificationConfig?: {
    onNewReceipt?: (receipt: ProcessedReceipt) => Promise<void>;
    onMatch?: (match: ReceiptMatch) => Promise<void>;
    onError?: (error: Error) => Promise<void>;
  };
}

interface ProcessedReceipt {
  id: string;
  originalFile: string;
  backupUrl: string;
  ocrData: {
    merchant: string;
    date: string;
    total: number;
    items?: Array<{ description: string; amount: number }>;
    confidence: number;
  };
  expense?: Expense;
  matchedTransaction?: ChaseTransaction;
  status: 'pending' | 'matched' | 'unmatched';
  processedAt: Date;
}

interface ReceiptMatch {
  receipt: ProcessedReceipt;
  transaction: ChaseTransaction;
  confidence: number;
}

export class AutomatedReceiptProcessor {
  private dbx: Dropbox;
  private cursor?: string;
  private isProcessing: boolean = false;

  constructor(private config: AutomatedReceiptConfig) {
    this.dbx = new Dropbox({
      accessToken: config.dropboxConfig.accessToken
    });
  }

  async startWatching(): Promise<void> {
    try {
      // Initialize folder watching
      const response = await this.dbx.filesListFolderGetLatestCursor({
        path: this.config.dropboxConfig.watchFolder,
        recursive: false,
        include_media_info: false
      });

      this.cursor = response.result.cursor;
      this.pollForChanges();

      Logger.info('Started watching Dropbox folder', {
        folder: this.config.dropboxConfig.watchFolder
      });
    } catch (error) {
      Logger.error('Failed to start watching Dropbox folder', { error });
      throw error;
    }
  }

  private async pollForChanges(): Promise<void> {
    if (!this.cursor || this.isProcessing) return;

    try {
      const response = await this.dbx.filesListFolderContinue({
        cursor: this.cursor
      });

      this.cursor = response.result.cursor;
      const newFiles = response.result.entries.filter(
        entry => entry['.tag'] === 'file' && 
        (entry.path_lower?.endsWith('.pdf') || 
         entry.path_lower?.endsWith('.jpg') ||
         entry.path_lower?.endsWith('.png'))
      );

      if (newFiles.length > 0) {
        this.isProcessing = true;
        await this.processNewReceipts(newFiles);
        this.isProcessing = false;
      }
    } catch (error) {
      Logger.error('Error polling Dropbox changes', { error });
    } finally {
      // Poll again after delay
      setTimeout(() => this.pollForChanges(), 30000);
    }
  }

  private async processNewReceipts(files: any[]): Promise<void> {
    for (const file of files) {
      try {
        // Download file from Dropbox
        const fileData = await this.dbx.filesDownload({ path: file.path_lower });
        const content = (fileData.result as any).fileBinary;

        // Process receipt with OCR
        const ocrResult = await processReceipt(new File([content], file.name));

        // Create backup in separate folder
        const backupPath = `${this.config.dropboxConfig.backupFolder}/${formatDateDisplay(new Date())}/${file.name}`;
        await this.dbx.filesCopy({
          from_path: file.path_lower,
          to_path: backupPath
        });

        // Create processed receipt record
        const processedReceipt: ProcessedReceipt = {
          id: `receipt-${Date.now()}`,
          originalFile: file.path_lower,
          backupUrl: backupPath,
          ocrData: ocrResult,
          status: 'pending',
          processedAt: new Date()
        };

        // Notify of new receipt
        await this.config.notificationConfig?.onNewReceipt?.(processedReceipt);

        // Delete original file
        await this.dbx.filesDelete({ path: file.path_lower });

        Logger.info('Successfully processed receipt', {
          file: file.name,
          merchant: ocrResult.merchant,
          amount: ocrResult.total
        });
      } catch (error) {
        Logger.error('Failed to process receipt', {
          file: file.name,
          error
        });
        await this.config.notificationConfig?.onError?.(error as Error);
      }
    }
  }

  async matchWithTransactions(
    receipts: ProcessedReceipt[],
    transactions: ChaseTransaction[]
  ): Promise<ReceiptMatch[]> {
    const matches: ReceiptMatch[] = [];

    for (const receipt of receipts) {
      if (receipt.status !== 'pending') continue;

      // Find potential matches
      const potentialMatches = transactions
        .map(transaction => ({
          transaction,
          confidence: matchReceiptToTransaction(
            receipt.ocrData,
            transaction.amount,
            transaction.date
          ).confidence
        }))
        .filter(match => match.confidence > 0.7)
        .sort((a, b) => b.confidence - a.confidence);

      if (potentialMatches.length > 0) {
        const bestMatch = potentialMatches[0];
        matches.push({
          receipt,
          transaction: bestMatch.transaction,
          confidence: bestMatch.confidence
        });

        // Update receipt status
        receipt.status = 'matched';
        receipt.matchedTransaction = bestMatch.transaction;

        // Notify of match
        await this.config.notificationConfig?.onMatch?.({
          receipt,
          transaction: bestMatch.transaction,
          confidence: bestMatch.confidence
        });
      } else {
        receipt.status = 'unmatched';
      }
    }

    return matches;
  }
}

// Usage example:
/*
const processor = new AutomatedReceiptProcessor({
  dropboxConfig: {
    appKey: process.env.DROPBOX_APP_KEY!,
    appSecret: process.env.DROPBOX_APP_SECRET!,
    accessToken: process.env.DROPBOX_ACCESS_TOKEN!,
    watchFolder: '/Receipts/Inbox',
    backupFolder: '/Receipts/Processed'
  },
  notificationConfig: {
    onNewReceipt: async (receipt) => {
      // Send notification, create expense record, etc.
    },
    onMatch: async (match) => {
      // Update transaction with receipt info
    },
    onError: async (error) => {
      // Send error notification
    }
  }
});

// Start watching for new receipts
await processor.startWatching();

// When new bank statement is uploaded
const matches = await processor.matchWithTransactions(
  pendingReceipts,
  bankTransactions
);
*/ 