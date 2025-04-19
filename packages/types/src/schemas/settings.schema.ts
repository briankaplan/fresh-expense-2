import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseDocument } from './base.schema';

export type SettingsDocument = Settings & Document;

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CAD = 'CAD',
  AUD = 'AUD',
}

export enum DateFormat {
  MM_DD_YYYY = 'MM/DD/YYYY',
  DD_MM_YYYY = 'DD/MM/YYYY',
  YYYY_MM_DD = 'YYYY-MM-DD',
}

export enum TimeZone {
  UTC = 'UTC',
  EST = 'America/New_York',
  PST = 'America/Los_Angeles',
  GMT = 'Europe/London',
  CET = 'Europe/Paris',
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    frequency: 'instant' | 'daily' | 'weekly';
    types: string[];
  };
  push: {
    enabled: boolean;
    types: string[];
  };
  inApp: {
    enabled: boolean;
    types: string[];
  };
}

export interface BudgetSettings {
  defaultPeriod: 'monthly' | 'quarterly' | 'yearly';
  rolloverEnabled: boolean;
  rolloverPeriod: number;
  alertThreshold: number;
  alertFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface ExportSettings {
  format: 'csv' | 'excel' | 'pdf';
  includeReceipts: boolean;
  includeMetadata: boolean;
  compression: boolean;
  defaultPath: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginAttempts: number;
  allowedIPs: string[];
}

@Schema({ timestamps: true })
export class Settings implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, enum: Currency, default: Currency.USD })
  currency!: Currency;

  @Prop({ required: true, enum: DateFormat, default: DateFormat.MM_DD_YYYY })
  dateFormat!: DateFormat;

  @Prop({ required: true, enum: TimeZone, default: TimeZone.UTC })
  timeZone!: TimeZone;

  @Prop({ type: Object })
  notifications?: NotificationSettings;

  @Prop({ type: Object })
  budget?: BudgetSettings;

  @Prop({ type: Object })
  export?: ExportSettings;

  @Prop({ type: Object })
  security?: SecuritySettings;

  @Prop({ type: Object })
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    defaultView: 'dashboard' | 'transactions' | 'budget';
    pageSize: number;
    autoSave: boolean;
    tooltips: boolean;
  };

  @Prop({ type: Object })
  integrations?: {
    [key: string]: {
      enabled: boolean;
      config: Record<string, any>;
      lastSync?: Date;
      status?: string;
    };
  };

  @Prop({ type: Object })
  backup?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    lastBackup?: Date;
    nextBackup?: Date;
    location: string;
    retention: number;
  };

  @Prop({ type: Object })
  metadata?: {
    version: string;
    lastUpdated: Date;
    updatedBy: string;
    history: {
      date: Date;
      changes: string[];
      user: string;
    }[];
  };

  constructor(partial: Partial<Settings>) {
    Object.assign(this, partial);
  }
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);

// Indexes
SettingsSchema.index({ userId: 1 }, { unique: true });
SettingsSchema.index({ 'preferences.theme': 1 });
SettingsSchema.index({ 'preferences.language': 1 });
SettingsSchema.index({ 'notifications.email.enabled': 1 });
SettingsSchema.index({ 'notifications.push.enabled': 1 });
SettingsSchema.index({ 'notifications.inApp.enabled': 1 });
