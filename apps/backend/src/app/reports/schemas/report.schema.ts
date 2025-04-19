import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export enum ReportType {
  EXPENSE = "expense",
  CATEGORY = "category",
  MERCHANT = "merchant",
  SUBSCRIPTION = "subscription",
  TAX = "tax",
}

export enum ReportFormat {
  PDF = "pdf",
  CSV = "csv",
  XLSX = "xlsx",
}

export class Report {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: "User" })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: "Company" })
  companyId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: ReportType })
  type: ReportType;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ type: Object })
  filters: Record<string, any>;

  @Prop({ required: true, enum: ReportFormat })
  format: ReportFormat;

  @Prop()
  fileUrl: string;

  @Prop({ default: false })
  isScheduled: boolean;

  @Prop()
  schedule: {
    frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
    dayOfWeek?: number;
    dayOfMonth?: number;
    timeOfDay?: string;
  };

  @Prop({ default: "pending" })
  status: string;

  @Prop()
  error: string;

  @Prop({ type: Object })
  summary: {
    totalAmount: number;
    count: number;
    byCategory?: Array<{
      categoryId: MongooseSchema.Types.ObjectId;
      amount: number;
      percentage: number;
    }>;
    byMerchant?: Array<{
      merchantId: MongooseSchema.Types.ObjectId;
      amount: number;
      percentage: number;
    }>;
    byDate?: Array<{
      date: Date;
      amount: number;
    }>;
  };

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

// Create indexes
ReportSchema.index({ userId: 1, createdAt: -1 });
ReportSchema.index({ companyId: 1, createdAt: -1 });
ReportSchema.index({ type: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ isScheduled: 1 });
