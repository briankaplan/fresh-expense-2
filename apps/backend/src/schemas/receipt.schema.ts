import type { BaseDocument } from "@fresh-expense/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type Document, Types } from "mongoose";

export type ReceiptDocument = Receipt & Document;

@Schema({ timestamps: true })
export class Receipt implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  fileKey!: string;

  @Prop({ required: true })
  fileUrl!: string;

  @Prop()
  thumbnailKey?: string;

  @Prop()
  thumbnailUrl?: string;

  @Prop({ required: true })
  fileName!: string;

  @Prop({ required: true })
  fileType!: string;

  @Prop({ required: true })
  fileSize!: number;

  @Prop({ required: true })
  rawText!: string;

  @Prop()
  total?: number;

  @Prop()
  date?: Date;

  @Prop()
  merchantName?: string;

  @Prop()
  merchantId?: string;

  @Prop()
  items?: {
    description: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
  }[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: "pending" })
  status!: "pending" | "processed" | "failed";

  @Prop()
  processingConfidence?: number;

  @Prop()
  transactionId?: string;

  constructor(partial: Partial<Receipt>) {
    Object.assign(this, partial);
  }
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);
