import type { Types } from "mongoose";

import type { ExpenseStatus } from "../lib/types";

export interface ExpenseBase {
  id: string;
  amount: {
    amount: number;
    currency: string;
  };
  date: Date;
  description: string;
  category: string;
  tags?: string[];
  status: ExpenseStatus;
  userId: string;
  companyId: string;
}

export interface ExpenseMetadata {
  project?: string;
  department?: string;
  costCenter?: string;
  [key: string]: any;
}

export interface Expense extends ExpenseBase {
  reportedAt?: Date;
  receiptId?: Types.ObjectId;
  notes?: string;
  metadata?: ExpenseMetadata;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isDeleted: boolean;
}

export const EXPENSE_TYPES = ["receipt", "bill", "subscription"] as const;
export type ExpenseType = (typeof EXPENSE_TYPES)[number];

export * from "./expense.schema";
