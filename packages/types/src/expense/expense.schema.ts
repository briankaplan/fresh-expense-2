import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type Document, Types } from "mongoose";

import { EXPENSE_CATEGORIES } from "../constants/category.constants";
import { ExpenseCategory, ExpenseStatus } from "../lib/types";
import type { BaseDocument } from "../schemas/base.schema";

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense implements BaseDocument {
  public _id!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt?: Date;
  public isDeleted!: boolean;

  @Prop({ required: true, type: Types.ObjectId, ref: "User", index: true })
  public userId!: Types.ObjectId | string;

  @Prop({ required: true, type: Types.ObjectId, ref: "Company", index: true })
  public companyId!: Types.ObjectId | string;

  @Prop({ required: true })
  public date!: Date;

  @Prop({
    required: true,
    type: {
      amount: { type: Number, required: true },
      currency: { type: String, required: true, default: "USD" },
    },
  })
  public amount!: {
    amount: number;
    currency: string;
  };

  @Prop({ required: true })
  public description!: string;

  @Prop({
    type: String,
    required: true,
    enum: EXPENSE_CATEGORIES,
  })
  public category!: string;

  @Prop({ type: [String], default: [] })
  public tags!: string[];

  @Prop({
    required: true,
    enum: ExpenseStatus,
    default: ExpenseStatus.PENDING,
  })
  public status!: ExpenseStatus;

  @Prop({ type: Date })
  public reportedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: "Receipt" })
  public receiptId?: Types.ObjectId;

  @Prop({ type: String })
  public notes?: string;

  @Prop({ type: Object })
  public metadata?: {
    project?: string;
    department?: string;
    costCenter?: string;
    [key: string]: any;
  };

  constructor(partial: Partial<Expense>) {
    Object.assign(this, partial);
  }
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
