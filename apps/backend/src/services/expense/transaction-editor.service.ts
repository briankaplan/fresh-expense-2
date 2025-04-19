import type { MongoDBService } from "@/core/database/mongodb.service";
import { EXPENSE_COLLECTION, type ExpenseSchema } from "@/core/database/schemas/expense.schema";
import {
  TRANSACTION_COLLECTION,
  type TransactionSchema,
} from "@/core/database/schemas/transaction.schema";
import { Injectable, Logger } from "@nestjs/common";
import type { Collection } from "mongodb";

@Injectable()
export class TransactionEditorService {
  private readonly logger = new Logger(TransactionEditorService.name);

  constructor(private readonly mongoDBService: MongoDBService) {}

  private async getTransactionCollection(): Promise<Collection<TransactionSchema>> {
    return this.mongoDBService.getCollection<TransactionSchema>(TRANSACTION_COLLECTION);
  }

  private async getExpenseCollection(): Promise<Collection<ExpenseSchema>> {
    return this.mongoDBService.getCollection<ExpenseSchema>(EXPENSE_COLLECTION);
  }

  async updateTransaction(
    transactionId: string,
    userId: string,
    updates: Partial<TransactionSchema>,
  ): Promise<TransactionSchema> {
    const transactionCollection = await this.getTransactionCollection();
    const expenseCollection = await this.getExpenseCollection();

    // Get the current transaction
    const transaction = await transactionCollection.findOne({
      _id: transactionId,
      userId,
    });
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    // Update the transaction
    const result = await transactionCollection.findOneAndUpdate(
      { _id: transactionId, userId },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
          metadata: {
            ...transaction.metadata,
            enrichmentSource: "manual",
            enrichmentTimestamp: new Date(),
          },
        },
      },
      { returnDocument: "after" },
    );

    if (!result) {
      throw new Error(`Failed to update transaction ${transactionId}`);
    }

    // If the transaction is linked to an expense, update the expense as well
    if (transaction.expenseId) {
      // Only sync common fields that are safe to update
      const expenseUpdates: Partial<ExpenseSchema> = {
        amount: updates.amount,
        category: updates.category,
        description: updates.description,
        date: updates.date,
        tags: updates.tags,
        merchantId: updates.merchantId,
        merchantName: updates.merchantName,
        merchantCategory: updates.merchantCategory,
        merchantLocation: updates.merchantLocation,
        isSubscription: updates.isSubscription,
        subscriptionId: updates.subscriptionId,
        subscriptionName: updates.subscriptionName,
        subscriptionFrequency: updates.subscriptionFrequency,
        subscriptionNextDate: updates.subscriptionNextDate,
        subscriptionEndDate: updates.subscriptionEndDate,
        receiptId: updates.receiptId,
        receiptUrl: updates.receiptUrl,
        receiptStatus: updates.receiptStatus,
        aiProcessed: updates.aiProcessed,
        aiCategory: updates.aiCategory,
        aiConfidence: updates.aiConfidence,
        aiDescription: updates.aiDescription,
        aiTags: updates.aiTags,
        updatedAt: new Date(),
        metadata: {
          ...transaction.metadata,
          enrichmentSource: "manual",
          enrichmentTimestamp: new Date(),
        },
      };

      await expenseCollection.updateOne({ _id: transaction.expenseId }, { $set: expenseUpdates });
    }

    return result;
  }

  async updateExpense(
    expenseId: string,
    userId: string,
    updates: Partial<ExpenseSchema>,
  ): Promise<ExpenseSchema> {
    const expenseCollection = await this.getExpenseCollection();
    const transactionCollection = await this.getTransactionCollection();

    // Get the current expense
    const expense = await expenseCollection.findOne({ _id: expenseId, userId });
    if (!expense) {
      throw new Error(`Expense ${expenseId} not found`);
    }

    // Update the expense
    const result = await expenseCollection.findOneAndUpdate(
      { _id: expenseId, userId },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
          metadata: {
            ...expense.metadata,
            enrichmentSource: "manual",
            enrichmentTimestamp: new Date(),
          },
        },
      },
      { returnDocument: "after" },
    );

    if (!result) {
      throw new Error(`Failed to update expense ${expenseId}`);
    }

    // If the expense is linked to a transaction, update the transaction as well
    if (expense.transactionId) {
      // Only sync common fields that are safe to update
      const transactionUpdates: Partial<TransactionSchema> = {
        amount: updates.amount,
        category: updates.category,
        description: updates.description,
        date: updates.date,
        tags: updates.tags,
        merchantId: updates.merchantId,
        merchantName: updates.merchantName,
        merchantCategory: updates.merchantCategory,
        merchantLocation: updates.merchantLocation,
        isSubscription: updates.isSubscription,
        subscriptionId: updates.subscriptionId,
        subscriptionName: updates.subscriptionName,
        subscriptionFrequency: updates.subscriptionFrequency,
        subscriptionNextDate: updates.subscriptionNextDate,
        subscriptionEndDate: updates.subscriptionEndDate,
        receiptId: updates.receiptId,
        receiptUrl: updates.receiptUrl,
        receiptStatus: updates.receiptStatus,
        aiProcessed: updates.aiProcessed,
        aiCategory: updates.aiCategory,
        aiConfidence: updates.aiConfidence,
        aiDescription: updates.aiDescription,
        aiTags: updates.aiTags,
        updatedAt: new Date(),
        metadata: {
          ...expense.metadata,
          enrichmentSource: "manual",
          enrichmentTimestamp: new Date(),
        },
      };

      await transactionCollection.updateOne(
        { _id: expense.transactionId },
        { $set: transactionUpdates },
      );
    }

    return result;
  }

  async matchReceipt(transactionId: string, receiptId: string, userId: string): Promise<void> {
    const transactionCollection = await this.getTransactionCollection();
    const expenseCollection = await this.getExpenseCollection();

    // Update transaction
    await transactionCollection.updateOne(
      { _id: transactionId, userId },
      {
        $set: {
          receiptId,
          receiptStatus: "matched",
          receiptMatchedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    );

    // If transaction is linked to an expense, update the expense as well
    const transaction = await transactionCollection.findOne({
      _id: transactionId,
    });
    if (transaction?.expenseId) {
      await expenseCollection.updateOne(
        { _id: transaction.expenseId },
        {
          $set: {
            receiptId,
            receiptStatus: "matched",
            receiptMatchedAt: new Date(),
            updatedAt: new Date(),
          },
        },
      );
    }
  }

  async unmatchReceipt(transactionId: string, userId: string): Promise<void> {
    const transactionCollection = await this.getTransactionCollection();
    const expenseCollection = await this.getExpenseCollection();

    // Update transaction
    await transactionCollection.updateOne(
      { _id: transactionId, userId },
      {
        $set: {
          receiptId: undefined,
          receiptStatus: "unmatched",
          receiptUnmatchedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    );

    // If transaction is linked to an expense, update the expense as well
    const transaction = await transactionCollection.findOne({
      _id: transactionId,
    });
    if (transaction?.expenseId) {
      await expenseCollection.updateOne(
        { _id: transaction.expenseId },
        {
          $set: {
            receiptId: undefined,
            receiptStatus: "unmatched",
            receiptUnmatchedAt: new Date(),
            updatedAt: new Date(),
          },
        },
      );
    }
  }
}
