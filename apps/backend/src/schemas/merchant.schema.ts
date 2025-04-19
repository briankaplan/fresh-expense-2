import type { BaseDocument } from "@fresh-expense/types";
import type { FrequencyType, TransactionCategory } from "@fresh-expense/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type Document, Schema as MongooseSchema } from "mongoose";

export type MerchantDocument = Merchant & Document;

@Schema({ timestamps: true })
export class Merchant implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: String, ref: "TransactionCategory" })
  category?: TransactionCategory;

  @Prop({ type: [String], default: [] })
  aliases!: string[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: [String] })
  tags?: string[];

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

  constructor(partial: Partial<Merchant>) {
    Object.assign(this, partial);
  }
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);
