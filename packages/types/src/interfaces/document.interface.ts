import { Document } from 'mongoose';
import { Transaction } from './transaction.interface';
import { Receipt } from './receipt.interface';
import { Merchant } from './merchant.interface';
import { Category } from './category.interface';
import { Budget } from './budget.interface';
import { Report } from './report.interface';
import { Subscription } from './subscription.interface';
import { Analytics } from './analytics.interface';
import { Search } from './search.interface';
import { AIModel } from './ai-model.interface';
import { OCR } from './ocr.interface';
import { Integration } from './integration.interface';
import { Settings } from './settings.interface';
import { SendGrid } from './sendgrid.interface';
import { UserDocument as SchemaUserDocument } from '../schemas/user.schema';

type PickNonId<T> = Pick<T, Exclude<keyof T, 'id'>>;

// Use the schema-based UserDocument
export type UserDocument = SchemaUserDocument;

export interface TransactionDocument extends PickNonId<Transaction>, Document {}
export interface ReceiptDocument extends PickNonId<Receipt>, Document {}
export interface MerchantDocument extends PickNonId<Merchant>, Document {}
export interface CategoryDocument extends PickNonId<Category>, Document {}
export interface BudgetDocument extends PickNonId<Budget>, Document {}
export interface ReportDocument extends PickNonId<Report>, Document {}
export interface SubscriptionDocument extends PickNonId<Subscription>, Document {}
export interface AnalyticsDocument extends PickNonId<Analytics>, Document {}
export interface SearchDocument extends PickNonId<Search>, Document {}
export interface AIModelDocument extends PickNonId<AIModel>, Document {}
export interface OCRDocument extends PickNonId<OCR>, Document {}
export interface IntegrationDocument extends PickNonId<Integration>, Document {}
export interface SettingsDocument extends PickNonId<Settings>, Document {}
export interface SendGridDocument extends PickNonId<SendGrid>, Document {}
