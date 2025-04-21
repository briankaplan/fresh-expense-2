import type { Document } from "mongoose";

import type { AIModel } from "./ai-model.interface";
import type { Analytics } from "./analytics.interface";
import type { Budget } from "./budget.interface";
import type { Category } from "./category.interface";
import type { Integration } from "./integration.interface";
import type { Merchant } from "./merchant.interface";
import type { OCR } from "./ocr.interface";
import type { Receipt } from "./receipt.interface";
import type { Report } from "./report.interface";
import type { Search } from "./search.interface";
import type { SendGrid } from "./sendgrid.interface";
import type { Settings } from "./settings.interface";
import type { Subscription } from "./subscription.interface";
import type { Transaction } from "./transaction.interface";
import type { UserDocument as SchemaUserDocument } from "../schemas/user.schema";

type PickNonId<T> = Pick<T, Exclude<keyof T, "id" | "_id">>;

// Use the schema-based UserDocument
export type UserDocument = SchemaUserDocument;

export interface TransactionDocument extends PickNonId<Transaction>, Document { }
export interface ReceiptDocument extends PickNonId<Receipt>, Document { }
export interface MerchantDocument extends PickNonId<Merchant>, Document { }
export interface CategoryDocument extends PickNonId<Category>, Document { }
export interface BudgetDocument extends PickNonId<Budget>, Document { }
export interface ReportDocument extends PickNonId<Report>, Document { }
export interface SubscriptionDocument extends PickNonId<Subscription>, Document { }
export interface AnalyticsDocument extends PickNonId<Analytics>, Document { }
export interface SearchDocument extends PickNonId<Search>, Document { }
export interface AIModelDocument extends PickNonId<AIModel>, Document { }
export interface OCRDocument extends PickNonId<OCR>, Document { }
export interface IntegrationDocument extends PickNonId<Integration>, Document { }
export interface SettingsDocument extends PickNonId<Settings>, Document { }
export interface SendGridDocument extends PickNonId<SendGrid>, Document { }
