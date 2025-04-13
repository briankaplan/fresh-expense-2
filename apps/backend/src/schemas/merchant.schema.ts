import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TRANSACTION_CATEGORIES } from '../types/transaction.types';

export type MerchantDocument = Merchant & Document;

interface SubscriptionInfo {
  isSubscription: boolean;
  frequency?: string;
  typicalAmount?: number;
  lastRenewalDate?: Date;
  nextRenewalDate?: Date;
  billingCycle: string;
  nextBillingDate: Date;
  amount: number;
  currency: string;
}

interface PurchaseHistory {
  totalTransactions: number;
  firstPurchaseDate: Date;
  lastPurchaseDate: Date;
  averageAmount: number;
  frequency: 'one-time' | 'recurring' | 'sporadic' | 'monthly';
  commonCategories: string[];
  monthlyTotals: Array<{
    month: Date;
    total: number;
    count: number;
  }>;
  totalAmount: number;
  lastAmount: number;
}

@Schema({ timestamps: true })
export class Merchant {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  category!: keyof typeof TRANSACTION_CATEGORIES;

  @Prop([String])
  aliases: string[] = [];

  @Prop([String])
  tags: string[] = [];

  @Prop()
  description: string = '';

  @Prop()
  businessType: string = '';

  @Prop([String])
  acceptedPaymentMethods: string[] = [];

  @Prop()
  returnsPolicy: string = '';

  @Prop([String])
  contactChannels: string[] = [];

  @Prop({ type: Object })
  subscription: SubscriptionInfo = {
    isSubscription: false,
    billingCycle: 'monthly',
    nextBillingDate: new Date(),
    amount: 0,
    currency: 'USD'
  };

  @Prop({ type: Object })
  purchaseHistory: PurchaseHistory = {
    totalTransactions: 0,
    firstPurchaseDate: new Date(),
    lastPurchaseDate: new Date(),
    averageAmount: 0,
    totalAmount: 0,
    lastAmount: 0,
    frequency: 'one-time',
    commonCategories: [],
    monthlyTotals: []
  };

  @Prop()
  lastEnrichmentDate?: Date;

  @Prop()
  enrichmentSource: string = '';

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant); 