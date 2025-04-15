import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TransactionCategory, FrequencyType } from '@packages/utils';

export type MerchantDocument = Merchant & Document;

@Schema({ timestamps: true })
export class Merchant {
  @Prop({ required: true })
  name!: string;

  @Prop({ type: String })
  category?: TransactionCategory;

  @Prop({ type: [String] })
  tags?: string[];

  @Prop({ type: [String] })
  aliases?: string[];

  @Prop({
    type: {
      isSubscription: Boolean,
      frequency: String,
      nextDate: Date,
      confidence: Number,
    },
  })
  subscription?: {
    isSubscription: boolean;
    frequency?: FrequencyType;
    nextDate?: Date;
    confidence: number;
  };

  @Prop({
    type: {
      totalSpent: Number,
      averageTransaction: Number,
      frequency: String,
      lastPurchase: Date,
      category: String,
      transactions: Array,
    },
  })
  purchaseHistory?: {
    totalSpent: number;
    averageTransaction: number;
    frequency?: FrequencyType;
    lastPurchase?: Date;
    category?: TransactionCategory;
    transactions: any[];
  };

  @Prop({
    type: {
      category: String,
      tags: [String],
      subscription: {
        isSubscription: Boolean,
        frequency: String,
        nextDate: Date,
        confidence: Number,
      },
      industry: String,
      subIndustry: String,
      businessType: String,
      paymentMethods: [String],
      returnsPolicy: String,
      contactInfo: {
        supportUrl: String,
      },
      lastEnrichmentDate: Date,
      enrichmentSource: String,
      lastUpdated: Date,
      confidence: Number,
    },
  })
  enrichedData?: {
    category?: TransactionCategory;
    tags?: string[];
    subscription?: {
      isSubscription: boolean;
      frequency?: FrequencyType;
      nextDate?: Date;
      confidence: number;
    };
    industry?: string;
    subIndustry?: string;
    businessType?: string;
    paymentMethods?: string[];
    returnsPolicy?: string;
    contactInfo?: {
      supportUrl?: string;
    };
    lastEnrichmentDate?: Date;
    enrichmentSource?: string;
    lastUpdated: Date;
    confidence: number;
  };
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);
