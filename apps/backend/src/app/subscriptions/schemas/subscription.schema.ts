import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export enum SubscriptionStatus {
  ACTIVE = "active",
  CANCELLED = "cancelled",
  PAUSED = "paused",
  EXPIRED = "expired",
}

export enum BillingCycle {
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  YEARLY = "yearly",
  CUSTOM = "custom",
}

export class Subscription {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: "User" })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: "Company" })
  companyId: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: "Merchant",
  })
  merchantId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: "USD" })
  currency: string;

  @Prop({ required: true, enum: BillingCycle })
  billingCycle: BillingCycle;

  @Prop()
  customBillingDays?: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate?: Date;

  @Prop({
    required: true,
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Prop()
  lastBillingDate?: Date;

  @Prop()
  nextBillingDate?: Date;

  @Prop()
  cancellationDate?: Date;

  @Prop()
  cancellationReason?: string;

  @Prop()
  autoRenew: boolean;

  @Prop()
  trialEndDate?: Date;

  @Prop()
  paymentMethodId: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

// Create indexes
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ companyId: 1, status: 1 });
SubscriptionSchema.index({ merchantId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ nextBillingDate: 1 });
