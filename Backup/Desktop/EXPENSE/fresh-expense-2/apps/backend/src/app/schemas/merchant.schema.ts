import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MerchantDocument = Merchant & Document;

interface ItemPattern {
  pattern: string;
  category: string;
  confidence: number;
  matches: number;
}

interface PricePattern {
  pattern: string;
  confidence: number;
  matches: number;
}

interface ReceiptPattern {
  headerPatterns: string[];
  footerPatterns: string[];
  confidence: number;
  matches: number;
}

@Schema({ timestamps: true })
export class Merchant {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [String] })
  aliases: string[];

  @Prop()
  category: string;

  @Prop({ type: [String] })
  tags: string[];

  @Prop()
  description?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  businessDetails?: {
    website?: string;
    phone?: string;
    address?: string;
    taxId?: string;
  };

  @Prop({ type: MongooseSchema.Types.Mixed })
  paymentMethods?: string[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  subscription?: {
    typical: boolean;
    frequency?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    averageAmount?: number;
    lastDetected?: Date;
  };

  @Prop({ type: MongooseSchema.Types.Mixed })
  learningData: {
    itemPatterns: ItemPattern[];
    pricePatterns: PricePattern[];
    receiptPatterns: ReceiptPattern;
    commonCategories: Array<{
      category: string;
      confidence: number;
      count: number;
    }>;
    averageTransaction: {
      amount: number;
      count: number;
    };
    lastUpdated: Date;
  };

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: {
    confidence: number;
    totalTransactions: number;
    lastTransaction?: Date;
    averageConfidence: number;
    recognitionRate: number;
  };
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant); 