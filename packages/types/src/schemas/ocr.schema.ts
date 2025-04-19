import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document } from "mongoose";
import type { BaseDocument } from "./base.schema";

export type OcrDocument = OCR & Document;

@Schema({ timestamps: true })
export class OCR implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop({ required: false })
  thumbnailUrl?: string;

  @Prop({ required: true })
  status!: "pending" | "processing" | "completed" | "failed";

  @Prop({ required: false })
  text?: string;

  @Prop({ required: false })
  confidence?: number;

  @Prop({ type: Object, required: false })
  results?: {
    text: string;
    confidence: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }[];

  @Prop({ required: false })
  error?: string;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;

  constructor(partial: Partial<OCR>) {
    Object.assign(this, partial);
  }
}

export const OcrSchema = SchemaFactory.createForClass(OCR);

// Indexes
OcrSchema.index({ userId: 1, status: 1 });
OcrSchema.index({ createdAt: -1 });
