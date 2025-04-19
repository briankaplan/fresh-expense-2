import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document } from "mongoose";
import type { ExpenseCategory } from "../lib/types";
import type { BaseDocument } from "./base.schema";

export type BudgetDocument = Budget & Document;

@Schema({ timestamps: true })
export class Budget implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  month!: string;

  @Prop({ required: true })
  year!: number;

  @Prop({ required: true, default: 0 })
  totalBudget!: number;

  @Prop({ type: Object, required: true, default: {} })
  categoryBudgets!: Record<ExpenseCategory, number>;

  @Prop({ type: Boolean, default: false })
  isActive!: boolean;

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;

  constructor(partial: Partial<Budget>) {
    Object.assign(this, partial);
  }
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);

// Indexes
BudgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });
BudgetSchema.index({ userId: 1, isActive: 1 });
BudgetSchema.index({ userId: 1, startDate: 1, endDate: 1 });
