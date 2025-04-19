import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document } from "mongoose";
import { SendGridStatus } from "../interfaces/sendgrid.interface";
import type { BaseDocument } from "./base.schema";

export type SendgridDocument = Sendgrid & Document;

export interface SendGridAttachment {
  filename: string;
  contentType: string;
  size: number;
  contentId?: string;
  disposition?: string;
  url?: string;
}

export interface SendGridMetadata {
  from: {
    email: string;
    name?: string;
  };
  to: {
    email: string;
    name?: string;
  }[];
  subject: string;
  date: Date;
  messageId: string;
  headers: Record<string, string>;
  spamScore?: number;
  dkim?: {
    valid: boolean;
    value: string;
  };
  spf?: {
    result: string;
    domain: string;
  };
}

@Schema({ timestamps: true })
export class Sendgrid implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({
    required: true,
    enum: SendGridStatus,
    default: SendGridStatus.PENDING,
  })
  status!: SendGridStatus;

  @Prop({ required: true })
  to!: string;

  @Prop({ required: true })
  from!: string;

  @Prop({ required: true })
  subject!: string;

  @Prop({ required: true })
  html!: string;

  @Prop({ required: false })
  error?: string;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;

  @Prop({ type: [Object] })
  attachments?: SendGridAttachment[];

  @Prop({ type: String })
  text?: string;

  @Prop({ type: String, ref: "Receipt" })
  receiptId?: string;

  @Prop({ type: Object })
  processing?: {
    startedAt?: Date;
    completedAt?: Date;
    error?: string;
    attempts: number;
    lastAttempt?: Date;
    processor?: string;
    steps: {
      name: string;
      status: "pending" | "completed" | "failed";
      startedAt?: Date;
      completedAt?: Date;
      error?: string;
    }[];
  };

  @Prop({ type: Object })
  validation?: {
    isValid: boolean;
    errors?: string[];
    warnings?: string[];
    rules: {
      name: string;
      passed: boolean;
      message?: string;
    }[];
  };

  @Prop({ type: Object })
  enrichment?: {
    merchant?: {
      id?: string;
      name?: string;
      confidence?: number;
    };
    category?: {
      id?: string;
      name?: string;
      confidence?: number;
    };
    amount?: {
      value?: number;
      currency?: string;
      confidence?: number;
    };
    date?: {
      value?: Date;
      confidence?: number;
    };
  };

  @Prop({ type: Object })
  stats?: {
    processingTime?: number;
    attachmentCount: number;
    totalSize: number;
    ocrTime?: number;
    matchingTime?: number;
  };

  @Prop({ type: [String] })
  tags?: string[];

  constructor(partial: Partial<Sendgrid>) {
    Object.assign(this, partial);
  }
}

export const SendgridSchema = SchemaFactory.createForClass(Sendgrid);

// Indexes
SendgridSchema.index({ userId: 1, status: 1 });
SendgridSchema.index({ createdAt: -1 });
SendgridSchema.index({ "metadata.date": 1 });
SendgridSchema.index({ "metadata.from.email": 1 });
SendgridSchema.index({ "metadata.to.email": 1 });
SendgridSchema.index({ receiptId: 1 });
SendgridSchema.index({ "processing.startedAt": 1 });
SendgridSchema.index({ "processing.completedAt": 1 });
SendgridSchema.index({ tags: 1 });
