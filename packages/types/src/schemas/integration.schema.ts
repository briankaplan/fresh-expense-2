import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document } from "mongoose";
import type { BaseDocument } from "./base.schema";

export type IntegrationDocument = Integration & Document;

export enum IntegrationType {
  BANK = "BANK",
  CREDIT_CARD = "CREDIT_CARD",
  INVESTMENT = "INVESTMENT",
  PAYMENT = "PAYMENT",
  EXPENSE = "EXPENSE",
  ACCOUNTING = "ACCOUNTING",
  STORAGE = "STORAGE",
  ANALYTICS = "ANALYTICS",
}

export enum IntegrationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ERROR = "ERROR",
  SYNCING = "SYNCING",
  PENDING = "PENDING",
}

export enum SyncFrequency {
  MANUAL = "MANUAL",
  HOURLY = "HOURLY",
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
}

export interface IntegrationCredentials {
  type: "oauth" | "api_key" | "password" | "token";
  encrypted: boolean;
  data: Record<string, any>;
  lastUpdated: Date;
}

export interface IntegrationSync {
  frequency: SyncFrequency;
  lastSync: Date;
  nextSync: Date;
  status: IntegrationStatus;
  error?: string;
  stats: {
    totalRecords: number;
    lastRecordDate: Date;
    syncDuration: number;
    successRate: number;
  };
}

export interface IntegrationMapping {
  sourceField: string;
  targetField: string;
  transform?: string;
  required: boolean;
}

export interface IntegrationWebhook {
  url: string;
  events: string[];
  secret?: string;
  lastTriggered?: Date;
  status: "active" | "inactive";
}

@Schema({ timestamps: true })
export class Integration implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, type: String, enum: IntegrationType })
  type!: IntegrationType;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  provider!: string;

  @Prop({
    type: String,
    enum: IntegrationStatus,
    default: IntegrationStatus.PENDING,
  })
  status!: IntegrationStatus;

  @Prop({ type: Object, required: false })
  credentials?: Record<string, any>;

  @Prop({ type: Date })
  lastSyncAt?: Date;

  @Prop({ type: Object, required: false })
  settings?: {
    autoSync?: boolean;
    syncInterval?: number;
    syncWindow?: {
      start: string;
      end: string;
    };
  };

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;

  @Prop({ type: Object })
  sync?: IntegrationSync;

  @Prop({ type: [Object] })
  mappings?: IntegrationMapping[];

  @Prop({ type: Object })
  webhook?: IntegrationWebhook;

  @Prop({ type: Object })
  config?: {
    autoSync: boolean;
    syncOnCreate: boolean;
    syncOnUpdate: boolean;
    syncOnDelete: boolean;
    batchSize: number;
    retryAttempts: number;
    timeout: number;
  };

  @Prop({ type: Object })
  stats?: {
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    averageSyncTime: number;
    lastError?: string;
    errorCount: number;
  };

  @Prop({ type: [String] })
  tags?: string[];

  constructor(partial: Partial<Integration>) {
    Object.assign(this, partial);
  }
}

export const IntegrationSchema = SchemaFactory.createForClass(Integration);

// Indexes
IntegrationSchema.index({ userId: 1, type: 1 });
IntegrationSchema.index({ userId: 1, provider: 1 });
IntegrationSchema.index({ userId: 1, status: 1 });
IntegrationSchema.index({ userId: 1, lastSyncAt: -1 });
IntegrationSchema.index({ "sync.nextSync": 1 });
IntegrationSchema.index({ "metadata.lastUpdated": 1 });
IntegrationSchema.index({ tags: 1 });
