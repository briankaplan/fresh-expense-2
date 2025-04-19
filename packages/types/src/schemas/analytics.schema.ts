import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document } from "mongoose";
import type { ExpenseCategory } from "../lib/types";
import type { BaseDocument } from "./base.schema";

export type AnalyticsDocument = Analytics & Document;

@Schema({ timestamps: true })
export class Analytics implements BaseDocument {
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
  totalSpent!: number;

  @Prop({ type: Object, required: true, default: {} })
  categoryBreakdown!: Record<ExpenseCategory, number>;

  @Prop({ type: Object, required: true, default: {} })
  merchantBreakdown!: Record<string, number>;

  @Prop({ type: Object, required: true, default: {} })
  dailySpending!: Record<string, number>;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;

  constructor(partial: Partial<Analytics>) {
    Object.assign(this, partial);
  }
}

export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);

// Indexes
AnalyticsSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });
AnalyticsSchema.index({ userId: 1, createdAt: -1 });
AnalyticsSchema.index({ sessionId: 1 });
AnalyticsSchema.index({ "location.coordinates": "2dsphere" });
