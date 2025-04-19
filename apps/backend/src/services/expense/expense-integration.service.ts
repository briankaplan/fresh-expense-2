import type { MongoDBService } from "@/core/database/mongodb.service";
import type { BaseSchema } from "@/core/database/schemas/base.schema";
import { EXPENSE_COLLECTION, type ExpenseSchema } from "@/core/database/schemas/expense.schema";
import {
  TRANSACTION_COLLECTION,
  type TransactionSchema,
} from "@/core/database/schemas/transaction.schema";
import { Injectable, Logger } from "@nestjs/common";
import type { Collection } from "mongodb";

@Injectable()
export class ExpenseIntegrationService {
  private readonly logger = new Logger(ExpenseIntegrationService.name);

  constructor(private readonly mongoDBService: MongoDBService) {}

  private async getTransactionCollection(): Promise<Collection<TransactionSchema>> {
    return this.mongoDBService.getCollection<TransactionSchema>(TRANSACTION_COLLECTION);
  }

  private async getExpenseCollection(): Promise<Collection<ExpenseSchema>> {
    return this.mongoDBService.getCollection<ExpenseSchema>(EXPENSE_COLLECTION);
  }

  async createExpenseFromTransaction(
    transactionId: string,
    companyId: string,
    userId: string,
  ): Promise<ExpenseSchema> {
    const transactionCollection = await this.getTransactionCollection();
    const transaction = await transactionCollection.findOne({
      _id: transactionId,
      userId,
    });

    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    if (transaction.isExpense) {
      throw new Error(`Transaction ${transactionId} is already marked as an expense`);
    }

    const expense: Omit<ExpenseSchema, keyof BaseSchema> = {
      userId,
      companyId,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
      tags: transaction.tags,
      transactionId: transaction._id,
      status: "pending",
      paymentMethod: "card", // Default to card since it's from Teller
      currency: "USD", // Default to USD, can be enhanced later
      metadata: {
        ...transaction.metadata,
        originalTransaction: transaction._id,
      },
    };

    const expenseCollection = await this.getExpenseCollection();
    const result = await expenseCollection.insertOne(expense as ExpenseSchema);

    // Update transaction to mark it as an expense
    await transactionCollection.updateOne(
      { _id: transaction._id },
      {
        $set: {
          isExpense: true,
          expenseId: result.insertedId,
          companyId,
          updatedAt: new Date(),
        },
      },
    );

    return { ...expense, _id: result.insertedId } as ExpenseSchema;
  }

  async getTransactionsForExpense(expenseId: string): Promise<TransactionSchema[]> {
    const transactionCollection = await this.getTransactionCollection();
    return transactionCollection.find({ expenseId }).toArray();
  }

  async getExpensesForTransaction(transactionId: string): Promise<ExpenseSchema[]> {
    const expenseCollection = await this.getExpenseCollection();
    return expenseCollection.find({ transactionId }).toArray();
  }

  async unlinkTransactionFromExpense(transactionId: string, expenseId: string): Promise<void> {
    const [transactionCollection, expenseCollection] = await Promise.all([
      this.getTransactionCollection(),
      this.getExpenseCollection(),
    ]);

    await Promise.all([
      transactionCollection.updateOne(
        { _id: transactionId },
        {
          $set: {
            isExpense: false,
            expenseId: undefined,
            companyId: undefined,
            updatedAt: new Date(),
          },
        },
      ),
      expenseCollection.updateOne(
        { _id: expenseId },
        {
          $set: {
            transactionId: undefined,
            updatedAt: new Date(),
          },
        },
      ),
    ]);
  }
}
