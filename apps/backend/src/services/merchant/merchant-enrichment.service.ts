import {
  type BaseTransactionData,
  Merchant,
  type MerchantDocument,
  Transaction,
  type TransactionDocument,
  type TransactionSummary,
  TransactionType,
  TransactionStatus,
} from "@fresh-expense/types";
import { Inject, Injectable } from "@nestjs/common";
import type { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";

import { BaseService } from "../base.service";
import type { NotificationService } from "../notification/notification.service";

@Injectable()
export class MerchantEnrichmentService extends BaseService {
  constructor(
    @InjectModel("Merchant")
    private readonly merchantModel: Model<MerchantDocument>,
    @InjectModel("Transaction")
    private readonly transactionModel: Model<TransactionDocument>,
    protected readonly notificationService: NotificationService,
    protected readonly eventEmitter: EventEmitter2,
  ) {
    super(notificationService, eventEmitter, "MerchantEnrichmentService");
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

    const transactionData: BaseTransactionData[] = transactions.map((t) => ({
      id: t._id.toString(),
      accountId: t.accountId,
      amount: t.amount,
      date: t.date,
      description: t.description,
      type: t.type,
      status: t.status,
      category: t.category,
      merchant: t.merchant,
      location: t.location,
      runningBalance: t.runningBalance,
      metadata: t.metadata,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    // Calculate summary
    const summary: TransactionSummary = {
      totalTransactions: transactions.length,
      totalAmount: {
        value: transactions.reduce((sum, t) => sum + t.amount.value, 0),
        currency: transactions[0]?.amount.currency || "USD",
      },
      byCategory: {},
      byMerchant: {},
      byType: {},
    };

    // Group by category
    transactions.forEach((t) => {
      const category = t.category || "uncategorized";
      if (!summary.byCategory[category]) {
        summary.byCategory[category] = {
          count: 0,
          amount: { value: 0, currency: t.amount.currency },
        };
      }
      summary.byCategory[category].count++;
      summary.byCategory[category].amount.value += t.amount.value;
    });

    // Group by merchant
    transactions.forEach((t) => {
      const merchantName = t.merchant.name;
      if (!summary.byMerchant[merchantName]) {
        summary.byMerchant[merchantName] = {
          count: 0,
          amount: { value: 0, currency: t.amount.currency },
        };
      }
      summary.byMerchant[merchantName].count++;
      summary.byMerchant[merchantName].amount.value += t.amount.value;
    });

    // Group by type
    transactions.forEach((t) => {
      const type = t.type;
      if (!summary.byType[type]) {
        summary.byType[type] = {
          count: 0,
          amount: { value: 0, currency: t.amount.currency },
        };
      }
      summary.byType[type].count++;
      summary.byType[type].amount.value += t.amount.value;
    });

    return summary;
  }

  async enrichTransaction(transaction: {
    type: TransactionType;
    status: TransactionStatus;
    // ... rest of the transaction
  }) {
    // ... implementation
  }
}
