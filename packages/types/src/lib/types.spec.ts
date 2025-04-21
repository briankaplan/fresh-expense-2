// External modules
import {
  type ApiResponse,
  Currency,
  type PaginatedResponse,
  type Transaction,
  type User,
} from "@fresh-expense/types";
import { describe, expect, it } from "vitest";

// Internal modules
import { TransactionStatus, TransactionType, TransactionSource, TRANSACTION_CATEGORIES } from "../constants/transaction.constants";
import { UserRole, UserStatus } from "../constants/user.constants";
import type { Receipt } from "../schemas/receipt.schema";
import { DateFormat, TimeZone } from "../schemas/settings.schema";

describe("Type Definitions", () => {
  it("should validate User type", () => {
    const user: User = {
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(user).toBeDefined();
  });

  it("should validate Transaction type", () => {
    const transaction: Transaction = {
      accountId: "123",
      amount: 100,
      date: new Date(),
      description: "Test transaction",
      category: TRANSACTION_CATEGORIES[0],
      status: TransactionStatus.PENDING,
      type: TransactionType.EXPENSE,
      source: TransactionSource.MANUAL,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(transaction).toBeDefined();
  });

  it("should validate Receipt type", () => {
    const receipt: Receipt = {
      _id: "1",
      userId: "1",
      url: "https://example.com/receipt.pdf",
      filename: "receipt.pdf",
      mimeType: "application/pdf",
      size: 1024,
      merchant: "Test Merchant",
      amount: 100.0,
      date: new Date("2024-01-01"),
      tags: [],
      isDeleted: false,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };
    expect(receipt).toBeDefined();
  });

  it("should validate ApiResponse type", () => {
    const response: ApiResponse<Transaction> = {
      data: {
        id: "123",
        accountId: "123",
        date: new Date(),
        description: "Test transaction",
        amount: {
          value: 100.0,
          currency: Currency.USD,
        },
        category: "FOOD",
        merchant: {
          name: "Test Merchant",
          category: "FOOD",
        },
        status: "pending",
        type: "expense",
        source: "manual",
        tags: ["test"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      statusCode: 200,
      message: "Success",
    };
    expect(response).toBeDefined();
  });

  it("should validate PaginatedResponse type", () => {
    const response: PaginatedResponse<Transaction> = {
      data: [
        {
          id: "1",
          accountId: "1",
          date: new Date("2024-01-01"),
          description: "Test transaction",
          amount: {
            value: 100.0,
            currency: Currency.USD,
          },
          category: "Food",
          merchant: {
            name: "Test Merchant",
            category: "Food",
          },
          status: "pending",
          type: "expense",
          source: "manual",
          createdAt: new Date("2024-01-01T00:00:00Z"),
          updatedAt: new Date("2024-01-01T00:00:00Z"),
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };
    expect(response).toBeDefined();
  });
});
