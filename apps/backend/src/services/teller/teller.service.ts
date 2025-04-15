import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as https from 'https';
import * as fs from 'fs';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { Transaction, TransactionDocument } from '../../schemas/transaction.schema';
import { TransactionDto } from '../../dto/transaction.dto';
import { plainToClass } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { HttpService } from '@nestjs/axios';

export interface TellerAccount {
  id: string;
  institution: {
    id: string;
    name: string;
  };
  currency: string;
  enrollment_id: string;
  last_four: string;
  links: {
    self: string;
    institution: string;
  };
  name: string;
  status: 'open' | 'closed';
  subtype: string;
  type: string;
}

export interface TellerTransaction {
  id: string;
  account_id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'pending' | 'posted' | 'canceled';
  running_balance: number;
  links: {
    self: string;
    account: string;
  };
  details?: {
    category?: string[];
    counterparty?: string;
    processing_status?: string;
  };
}

interface TellerQuery {
  from?: string;
  to?: string;
  count?: number;
  offset?: number;
}

@Injectable()
export class TellerService {
  private readonly logger = new Logger(TellerService.name);
  private readonly axiosInstance: AxiosInstance;
  private lastSyncTime: { [accountId: string]: Date } = {};
  private readonly HISTORICAL_START_DATE = new Date('2024-01-01');
  private readonly PAGE_SIZE = 100;
  private readonly webhookSecret: string;
  private readonly webhookKey: string;
  private readonly apiKey: string;
  private readonly environment: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    private readonly httpService: HttpService
  ) {
    this.apiKey = this.configService.get<string>('TELLER_API_KEY') || '';
    this.environment = this.configService.get<string>('TELLER_ENV') || 'sandbox';
    this.webhookSecret = this.configService.get<string>('TELLER_WEBHOOK_SECRET') || '';
    this.webhookKey = this.configService.get<string>('TELLER_WEBHOOK_KEY') || '';
    
    // Initialize axios instance with mTLS
    const certPath = this.configService.get<string>('TELLER_CERTIFICATE_PATH');
    const keyPath = this.configService.get<string>('TELLER_PRIVATE_KEY_PATH');
    const token = this.configService.get<string>('TELLER_ACCESS_TOKEN');

    if (!certPath || !keyPath || !token) {
      throw new Error('Missing required Teller configuration');
    }

    const httpsAgent = new https.Agent({
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
      rejectUnauthorized: true
    });

    this.axiosInstance = axios.create({
      baseURL: 'https://api.teller.io',
      httpsAgent,
      headers: {
        'Authorization': `Basic ${Buffer.from(token + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getAccounts(): Promise<TellerAccount[]> {
    try {
      const response = await this.axiosInstance.get('/accounts');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error('Error fetching Teller accounts:', {
        status: axiosError.response?.status,
        message: axiosError.message,
        data: axiosError.response?.data
      });
      throw error;
    }
  }

  private async getLastSyncedTransaction(accountId: string): Promise<Date | null> {
    const lastTransaction = await this.transactionModel
      .findOne({ accountId })
      .sort({ date: -1 })
      .exec();
    
    return lastTransaction ? lastTransaction.date : null;
  }

  async shouldSyncAccount(accountId: string): Promise<boolean> {
    const lastSync = this.lastSyncTime[accountId];
    if (!lastSync) return true;

    const now = new Date();
    const hoursSinceLastSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastSync >= 24;
  }

  private async fetchTransactionsPage(accountId: string, fromDate: Date, count: number = this.PAGE_SIZE): Promise<TellerTransaction[]> {
    try {
      const response = await this.axiosInstance.get(`/accounts/${accountId}/transactions`, {
        params: {
          from_date: fromDate.toISOString().split('T')[0],
          count
        }
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(`Error fetching transactions page for account ${accountId}:`, {
        status: axiosError.response?.status,
        message: axiosError.message,
        data: axiosError.response?.data
      });
      throw error;
    }
  }

  async syncTransactions(accountId: string, forceHistorical: boolean = false): Promise<void> {
    try {
      if (!forceHistorical && !await this.shouldSyncAccount(accountId)) {
        this.logger.log(`Skipping sync for account ${accountId} - last sync was less than 24 hours ago`);
        return;
      }

      let fromDate: Date;
      if (forceHistorical) {
        fromDate = this.HISTORICAL_START_DATE;
        this.logger.log(`Starting historical sync for account ${accountId} from ${fromDate.toISOString()}`);
      } else {
        const lastSyncedDate = await this.getLastSyncedTransaction(accountId);
        fromDate = lastSyncedDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default to 7 days ago
      }

      let hasMore = true;
      let totalSynced = 0;

      while (hasMore) {
        const transactions = await this.fetchTransactionsPage(accountId, fromDate);
        
        if (transactions.length === 0) {
          hasMore = false;
          continue;
        }

        for (const transaction of transactions) {
          await this.upsertTransaction(transaction);
        }

        totalSynced += transactions.length;
        this.logger.log(`Synced ${transactions.length} transactions for account ${accountId}`);

        if (transactions.length < this.PAGE_SIZE) {
          hasMore = false;
        } else {
          // Update fromDate to the date of the last transaction
          const lastTransactionDate = new Date(transactions[transactions.length - 1].date);
          fromDate = new Date(lastTransactionDate.getTime() + 1); // Add 1ms to avoid duplication
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.lastSyncTime[accountId] = new Date();
      this.logger.log(`Successfully synced ${totalSynced} total transactions for account ${accountId}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(`Error syncing transactions for account ${accountId}:`, {
        status: axiosError.response?.status,
        message: axiosError.message,
        data: axiosError.response?.data
      });
      throw error;
    }
  }

  private async mapAndValidateTransaction(tellerTransaction: TellerTransaction): Promise<TransactionDto> {
    // Extract merchant info from description (if available)
    const merchantInfo = this.extractMerchantInfo(tellerTransaction.description);
    
    const transaction = plainToClass(TransactionDto, {
      externalId: tellerTransaction.id,
      accountId: tellerTransaction.account_id,
      date: new Date(tellerTransaction.date),
      description: tellerTransaction.description,
      amount: parseFloat(tellerTransaction.amount.toString()),
      type: parseFloat(tellerTransaction.amount.toString()) < 0 ? 'debit' : 'credit',
      status: tellerTransaction.status,
      category: tellerTransaction.details?.category || [],
      processingStatus: tellerTransaction.details?.processing_status || 'processed',
      runningBalance: this.parseRunningBalance(tellerTransaction.running_balance),
      source: 'teller',
      lastUpdated: new Date(),
      merchantName: merchantInfo.name,
      merchantCategory: merchantInfo.category,
      location: merchantInfo.location,
      isRecurring: this.detectRecurringTransaction(tellerTransaction),
      originalPayload: tellerTransaction
    });

    // Validate the mapped data
    try {
      await validateOrReject(transaction);
      return transaction;
    } catch (errors) {
      const validationErrors = errors as ValidationError[];
      this.logger.error(`Validation failed for transaction ${tellerTransaction.id}:`, validationErrors);
      throw new Error(`Transaction validation failed: ${validationErrors.map(e => Object.values(e.constraints || {})).join(', ')}`);
    }
  }

  private extractMerchantInfo(description: string): { name?: string; category?: string; location?: string } {
    // Basic merchant info extraction (can be improved with ML/regex patterns)
    const parts = description.split(' ');
    return {
      name: parts[0],
      category: this.categorizeMerchant(description),
      location: parts[parts.length - 1]
    };
  }

  private categorizeMerchant(description: string): string {
    // Simple categorization logic (can be improved with ML/regex patterns)
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('restaurant') || lowerDesc.includes('food')) return 'dining';
    if (lowerDesc.includes('gas') || lowerDesc.includes('fuel')) return 'transportation';
    if (lowerDesc.includes('amazon') || lowerDesc.includes('walmart')) return 'shopping';
    return 'other';
  }

  private detectRecurringTransaction(transaction: TellerTransaction): boolean {
    // Simple recurring detection logic (can be improved)
    const recurringKeywords = ['subscription', 'monthly', 'recurring', 'netflix', 'spotify'];
    return recurringKeywords.some(keyword => 
      transaction.description.toLowerCase().includes(keyword)
    );
  }

  private parseRunningBalance(balance: string | undefined): number {
    if (!balance) return 0;
    return parseFloat(balance) || 0;
  }

  private async upsertTransaction(tellerTransaction: TellerTransaction) {
    try {
      const validatedTransaction = await this.mapAndValidateTransaction(tellerTransaction);
      
      await this.transactionModel.findOneAndUpdate(
        { externalId: validatedTransaction.externalId },
        validatedTransaction,
        { upsert: true, new: true }
      );
    } catch (error) {
      this.logger.error(`Error upserting transaction ${tellerTransaction.id}:`, error);
      throw error;
    }
  }

  async syncAllAccounts(forceHistorical: boolean = false): Promise<void> {
    try {
      const accounts = await this.getAccounts();
      
      for (const account of accounts) {
        await this.syncTransactions(account.id, forceHistorical);
      }
      
      this.logger.log(`Completed syncing all accounts${forceHistorical ? ' (historical)' : ''}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error('Error syncing all accounts:', {
        status: axiosError.response?.status,
        message: axiosError.message,
        data: axiosError.response?.data
      });
      throw error;
    }
  }

  async getTransactions(accountId: string, query?: TellerQuery): Promise<TellerTransaction[]> {
    try {
      const response = await this.axiosInstance.get(`/accounts/${accountId}/transactions`, {
        params: query
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`Failed to fetch transactions: ${error.message}`);
      } else {
        this.logger.error('Unknown error fetching transactions');
      }
      throw error;
    }
  }

  async getAccount(accountId: string): Promise<TellerAccount> {
    try {
      const response = await this.axiosInstance.get(`/accounts/${accountId}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`Failed to fetch account: ${error.message}`);
      } else {
        this.logger.error('Unknown error fetching account');
      }
      throw error;
    }
  }

  async countTransactions(query: TellerQuery = {}): Promise<number> {
    try {
      const response = await this.axiosInstance.get('/transactions/count', {
        params: query
      });
      return response.data.count;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error('Error counting transactions:', error.message);
      } else {
        this.logger.error('Unknown error counting transactions');
      }
      throw error;
    }
  }

  async verifyWebhookSignature(signature: string, payload: string): Promise<boolean> {
    if (!this.webhookSecret || !this.webhookKey) {
      this.logger.warn('Webhook secret or key not configured');
      return false;
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    const signatureBytes = this.hexToArrayBuffer(signature);
    const payloadBytes = encoder.encode(payload);

    return crypto.subtle.verify('HMAC', key, signatureBytes, payloadBytes);
  }

  private hexToArrayBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
  }

  async handleTransactionCreated(payload: TellerTransaction): Promise<void> {
    try {
      this.logger.log('Handling transaction created webhook');
      // TODO: Implement transaction creation logic
    } catch (error) {
      this.logger.error('Error handling transaction created webhook', error);
      throw error;
    }
  }

  async handleTransactionUpdated(payload: TellerTransaction): Promise<void> {
    try {
      this.logger.log('Handling transaction updated webhook');
      // TODO: Implement transaction update logic
    } catch (error) {
      this.logger.error('Error handling transaction updated webhook', error);
      throw error;
    }
  }

  async handleAccountUpdated(payload: TellerAccount): Promise<void> {
    try {
      this.logger.log('Handling account updated webhook');
      // TODO: Implement account update logic
    } catch (error) {
      this.logger.error('Error handling account updated webhook', error);
      throw error;
    }
  }
} 