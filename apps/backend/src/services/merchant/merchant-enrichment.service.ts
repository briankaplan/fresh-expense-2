import { Injectable, Inject } from '@nestjs/common';
import { BaseService } from '../base.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Merchant, MerchantDocument } from './schemas/merchant.schema';
import { Transaction } from '../transaction/schemas/transaction.schema';
import {
  TransactionCategory,
  FrequencyType,
  TransactionSummary,
  BaseTransactionData,
  determineCategory
} from '@packages/utils';
import { NotificationService } from '../notification/notification.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MerchantEnrichmentService extends BaseService {
  constructor(
    @InjectModel(Merchant.name) private readonly merchantModel: Model<MerchantDocument>,
    @InjectModel(Transaction.name) private readonly transactionModel: Model<Transaction>,
    protected readonly notificationService: NotificationService,
    protected readonly eventEmitter: EventEmitter2
  ) {
    super(notificationService, eventEmitter, 'MerchantEnrichmentService');
  }

  async getPurchaseHistory(merchantId: string): Promise<TransactionSummary> {
    const merchant = await this.merchantModel.findById(merchantId).exec();
    if (!merchant) {
      throw new Error(`Merchant not found: ${merchantId}`);
    }

    const transactions = await this.transactionModel
      .find({ merchantId: merchant._id })
      .sort({ date: -1 })
      .exec();

    const transactionData: BaseTransactionData[] = transactions.map(t => ({
      id: t._id.toString(),
      accountId: t.accountId,
      amount: t.amount,
      date: t.date,
      description: t.description,
      type: t.type,
      status: t.status,
      category: t.category,
      merchantName: t.merchantName,
      location: t.location,
      runningBalance: t.runningBalance,
      isRecurring: t.isRecurring,
      notes: t.notes,
      tags: t.tags,
      metadata: t.metadata,
      lastUpdated: t.lastUpdated,
    }));

    const totalSpent = transactionData.reduce((sum, t) => sum + t.amount, 0);
    const averageTransaction = transactionData.length > 0 ? totalSpent / transactionData.length : 0;
    const lastPurchase = transactionData.length > 0
      ? new Date(Math.max(...transactionData.map(t => t.date.getTime())))
      : undefined;

    const frequency = this.calculateFrequency(transactionData.length);
    const category = determineCategory(transactionData);

    return {
      totalSpent,
      averageTransaction,
      frequency,
      lastPurchase,
      category,
      transactions: transactionData
    };
  }

  private calculateFrequency(transactionCount: number): FrequencyType {
    if (transactionCount <= 2) return 'monthly';
    if (transactionCount <= 5) return 'weekly';
    return 'daily';
  }
}
