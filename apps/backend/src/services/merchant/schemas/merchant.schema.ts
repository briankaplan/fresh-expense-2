import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TransactionCategory, FrequencyType } from '@packages/utils';

export type MerchantDocument = Merchant & Document;

export interface SubscriptionInfo {
  isSubscription: boolean;
  frequency?: FrequencyType;
  nextDate?: Date;
  confidence: number;
}

export interface PurchaseHistory {
  totalSpent: number;
  averageTransaction: number;
  frequency?: FrequencyType;
  lastPurchase?: Date;
  category?: TransactionCategory;
  transactions: Array<{
    id: string;
    accountId: string;
    amount: number;
    date: Date;
    description: string;
    type: 'debit' | 'credit';
    status: 'pending' | 'posted' | 'canceled';
    category?: TransactionCategory;
    merchantName?: string;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      coordinates?: [number, number];
    };
  }>;
}

export interface EnrichedData {
  category?: TransactionCategory;
  tags?: string[];
  subscription?: SubscriptionInfo;
  industry?: string;
  subIndustry?: string;
  businessType?: string;
  paymentMethods?: string[];
  returnsPolicy?: string;
  contactInfo?: {
    supportUrl?: string;
  };
  lastEnrichmentDate: Date;
  enrichmentSource: string;
  lastUpdated: Date;
  confidence: number;
}

@Schema({ timestamps: true })
export class Merchant {
  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop()
  category?: TransactionCategory;

  @Prop()
  tellerMerchantId?: string;

  @Prop({
    type: [{
      address: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    }]
  })
  locations?: Array<{
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    coordinates?: [number, number];
  }>;

  @Prop()
  website?: string;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  lastUpdated?: Date;

  @Prop({ type: Object })
  subscription?: SubscriptionInfo;

  @Prop({ type: Object })
  purchaseHistory?: PurchaseHistory;

  @Prop({ type: Object })
  enrichedData?: EnrichedData;

  @Prop([String])
  tags?: string[];

  @Prop([String])
  aliases?: string[];
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);
