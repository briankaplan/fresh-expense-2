import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document } from "mongoose";
import type { ExpenseCategory } from "../lib/types";
import type { BaseDocument } from "./base.schema";

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, type: String })
  name!: ExpenseCategory;

  @Prop({ required: true })
  icon!: string;

  @Prop({ required: true })
  color!: string;

  @Prop()
  description?: string;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: Number, default: 0 })
  transactionCount!: number;

  @Prop({ type: Number, default: 0 })
  totalAmount!: number;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;

  constructor(partial: Partial<Category>) {
    Object.assign(this, partial);
  }
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Indexes
CategorySchema.index({ userId: 1, name: 1 }, { unique: true });
CategorySchema.index({ userId: 1, isActive: 1 });
