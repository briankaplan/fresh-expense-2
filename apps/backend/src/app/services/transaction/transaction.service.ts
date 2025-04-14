import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense } from '../expense/schemas/expense.schema';
import { Receipt } from '../receipt/schemas/receipt.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface TransactionQuery {
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  matched?: boolean;
  source?: 'mongodb' | 'teller' | 'auto';
}

interface SyncOptions {
  force?: boolean;
  days?: number;
  matchReceipts?: boolean;
  source?: 'teller' | 'all';
}

interface ExternalTransaction {
  externalId: string;
  date: Date;
  amount: number;
  merchant: string;
  description?: string;
  category?: string;
  details?: {
    counterparty?: {
      name?: string;
    };
  };
}

interface MatchResult {
  receipt: Receipt;
  score: number;
}

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);
  private readonly SYNC_BATCH_SIZE = 100;
  private readonly MATCH_THRESHOLD = 0.8; // 80% similarity threshold for matching

  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    @InjectModel(Receipt.name) private receiptModel: Model<Receipt>,
    private eventEmitter: EventEmitter2,
  ) {}

  async getTransactions(query: TransactionQuery) {
    try {
      const {
        page = 1,
        limit = 50,
        sortField = 'date',
        sortOrder = 'desc',
        search,
        category,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        matched,
        source = 'auto'
      } = query;

      // Build filter
      const filter: any = {};

      // Add search filter if provided
      if (search) {
        filter.$or = [
          { description: { $regex: search, $options: 'i' } },
          { merchant: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }

      if (category) {
        filter.category = category;
      }

      if (startDate || endDate) {
        filter.date = {};
        if (startDate) {
          filter.date.$gte = new Date(startDate);
        }
        if (endDate) {
          filter.date.$lte = new Date(endDate);
        }
      }

      if (minAmount !== undefined || maxAmount !== undefined) {
        filter.amount = {};
        if (minAmount !== undefined) filter.amount.$gte = minAmount;
        if (maxAmount !== undefined) filter.amount.$lte = maxAmount;
      }

      if (matched !== undefined) {
        filter.matched = matched;
      }

      // Build sort
      const sort: any = {};
      sort[sortField] = sortOrder === 'asc' ? 1 : -1;

      // Get total count for pagination
      const total = await this.expenseModel.countDocuments(filter);

      // Get paginated results
      const transactions = await this.expenseModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      // Format transactions
      const formattedTransactions = transactions.map(tx => ({
        ...tx.toObject(),
        id: tx._id.toString(),
        date: tx.date instanceof Date ? tx.date.toISOString().split('T')[0] : tx.date,
        amount: typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount,
        merchant: tx.merchant && tx.merchant !== 'Unknown' ? tx.merchant : 
                 (tx.details?.counterparty?.name || 
                  (tx.description && tx.description.includes(' - ') ? tx.description.split(' - ')[0] : null) || 
                  'Unknown'),
        description: tx.description || '',
        category: tx.category || 'Uncategorized',
        matched: !!tx.matched,
        tags: Array.isArray(tx.tags) ? tx.tags : [],
        source: 'mongodb',
        source_db: 'primary'
      }));

      return {
        transactions: formattedTransactions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.logger.error('Error getting transactions:', error);
      throw error;
    }
  }

  async getTransactionById(id: string) {
    try {
      const transaction = await this.expenseModel.findById(id).exec();
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Get receipt if exists
      let receipt = null;
      if (transaction.receiptId) {
        receipt = await this.receiptModel.findOne({
          $or: [
            { _id: transaction.receiptId },
            { expense_id: transaction._id }
          ]
        }).exec();
      }

      return {
        transaction,
        receipt
      };
    } catch (error) {
      this.logger.error('Error getting transaction details:', error);
      throw error;
    }
  }

  async matchTransactionWithReceipt(transactionId: string, receiptId: string) {
    try {
      const transaction = await this.expenseModel.findById(transactionId).exec();
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const receipt = await this.receiptModel.findById(receiptId).exec();
      if (!receipt) {
        throw new Error('Receipt not found');
      }

      // Update transaction
      await this.expenseModel.findByIdAndUpdate(transactionId, {
        $set: {
          receiptId,
          matched: true,
          matchedAt: new Date()
        }
      }).exec();

      // Update receipt
      await this.receiptModel.findByIdAndUpdate(receiptId, {
        $set: {
          transactionId,
          matched: true,
          matchedAt: new Date()
        }
      }).exec();

      return {
        success: true,
        message: 'Transaction matched with receipt successfully',
        matchedAt: new Date(),
        transactionId,
        receiptId
      };
    } catch (error) {
      this.logger.error('Error matching transaction with receipt:', error);
      throw error;
    }
  }

  async unmatchTransaction(transactionId: string) {
    try {
      const transaction = await this.expenseModel.findById(transactionId).exec();
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (!transaction.receiptId) {
        throw new Error('Transaction does not have a matched receipt');
      }

      const receiptId = transaction.receiptId;

      // Update transaction
      await this.expenseModel.findByIdAndUpdate(transactionId, {
        $unset: { receiptId: "" },
        $set: {
          matched: false,
          unmatchedAt: new Date()
        }
      }).exec();

      // Update receipt
      await this.receiptModel.findByIdAndUpdate(receiptId, {
        $unset: { transactionId: "" },
        $set: {
          matched: false,
          unmatchedAt: new Date()
        }
      }).exec();

      return {
        success: true,
        message: 'Transaction unmatched from receipt successfully'
      };
    } catch (error) {
      this.logger.error('Error unmatching transaction from receipt:', error);
      throw error;
    }
  }

  async syncTransactions(options: SyncOptions = {}) {
    const { force = false, days = 30, matchReceipts = true, source = 'all' } = options;
    
    try {
      this.logger.log('Starting transaction sync...');
      this.eventEmitter.emit('sync.started', { timestamp: new Date() });

      let syncedCount = 0;
      let matchedCount = 0;

      // Get transactions from external sources
      const externalTransactions = await this.getExternalTransactions(days, source);
      
      // Process in batches for better performance
      for (let i = 0; i < externalTransactions.length; i += this.SYNC_BATCH_SIZE) {
        const batch = externalTransactions.slice(i, i + this.SYNC_BATCH_SIZE);
        
        // Use bulk operations for better performance
        const bulkOps = this.expenseModel.collection.initializeUnorderedBulkOp();
        
        for (const tx of batch) {
          // Check if transaction already exists
          const existingTx = await this.expenseModel.findOne({
            $or: [
              { externalId: tx.externalId },
              { 
                date: tx.date,
                amount: tx.amount,
                merchant: tx.merchant
              }
            ]
          });

          if (!existingTx || force) {
            // Add to bulk operation
            bulkOps.find({ _id: existingTx?._id || new Date().getTime() })
              .upsert()
              .updateOne({
                $set: {
                  ...tx,
                  lastSynced: new Date(),
                  source: 'external'
                }
              });
            
            syncedCount++;
          }
        }

        // Execute bulk operation
        const bulkResult = await bulkOps.execute();
        this.logger.log(`Synced batch of ${batch.length} transactions`);

        // Match receipts if requested
        if (matchReceipts) {
          const matched = await this.matchReceiptsForBatch(batch);
          matchedCount += matched;
        }

        // Emit progress event
        this.eventEmitter.emit('sync.progress', {
          processed: i + batch.length,
          total: externalTransactions.length,
          synced: syncedCount,
          matched: matchedCount
        });
      }

      this.logger.log('Transaction sync completed');
      this.eventEmitter.emit('sync.completed', {
        timestamp: new Date(),
        syncedCount,
        matchedCount
      });

      return {
        success: true,
        syncedCount,
        matchedCount
      };
    } catch (error) {
      this.logger.error('Error syncing transactions:', error);
      this.eventEmitter.emit('sync.failed', { error });
      throw error;
    }
  }

  private async getExternalTransactions(days: number, source: string): Promise<ExternalTransaction[]> {
    // This would integrate with external services like Teller
    // For now, returning mock data
    return [];
  }

  private async matchReceiptsForBatch(transactions: ExternalTransaction[]) {
    let matchedCount = 0;

    // Get unmatched receipts
    const unmatchedReceipts = await this.receiptModel.find({
      matched: { $ne: true }
    }).exec();

    // Process in parallel for better performance
    const matchPromises = transactions.map(async tx => {
      const bestMatch = await this.findBestReceiptMatch(tx, unmatchedReceipts);
      
      if (bestMatch && bestMatch.score >= this.MATCH_THRESHOLD) {
        await this.matchTransactionWithReceipt(tx.externalId, bestMatch.receipt._id.toString());
        matchedCount++;
      }
    });

    await Promise.all(matchPromises);
    return matchedCount;
  }

  private async findBestReceiptMatch(transaction: ExternalTransaction, receipts: Receipt[]): Promise<MatchResult | null> {
    let bestMatch: MatchResult | null = null;
    let bestScore = 0;

    for (const receipt of receipts) {
      const score = this.calculateMatchScore(transaction, receipt);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { receipt, score };
      }
    }

    return bestMatch;
  }

  private calculateMatchScore(transaction: ExternalTransaction, receipt: Receipt): number {
    let score = 0;
    const weights = {
      amount: 0.4,
      date: 0.3,
      merchant: 0.3
    };

    // Amount match (within 1% tolerance)
    const amountDiff = Math.abs(transaction.amount - receipt.amount);
    const amountTolerance = Math.abs(transaction.amount) * 0.01;
    if (amountDiff <= amountTolerance) {
      score += weights.amount;
    }

    // Date match (within 1 day)
    const dateDiff = Math.abs(
      new Date(transaction.date).getTime() - new Date(receipt.date).getTime()
    );
    if (dateDiff <= 24 * 60 * 60 * 1000) { // 1 day in milliseconds
      score += weights.date;
    }

    // Merchant name match (using similarity)
    if (this.areMerchantsSimilar(transaction.merchant, receipt.merchant)) {
      score += weights.merchant;
    }

    return score;
  }

  private areMerchantsSimilar(merchant1: string, merchant2: string): boolean {
    if (!merchant1 || !merchant2) return false;
    
    // Normalize merchant names
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const norm1 = normalize(merchant1);
    const norm2 = normalize(merchant2);
    
    // Check for exact match after normalization
    if (norm1 === norm2) return true;
    
    // Check for partial match
    return norm1.includes(norm2) || norm2.includes(norm1);
  }
} 