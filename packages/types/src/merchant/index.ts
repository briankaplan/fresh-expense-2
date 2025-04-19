import type { Types } from "mongoose";

export interface MerchantBase {
  id: string;
  name: string;
  category?: string;
  description?: string;
  website?: string;
  logoUrl?: string;
}

export interface MerchantMetadata {
  industry?: string;
  subCategory?: string;
  tags?: string[];
  [key: string]: any;
}

export interface Merchant extends MerchantBase {
  userId: string;
  companyId: string;
  metadata?: MerchantMetadata;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isDeleted: boolean;
}

export const MERCHANT_CATEGORIES = [
  "retail",
  "food",
  "travel",
  "utilities",
  "entertainment",
  "services",
  "other",
] as const;

export type MerchantCategory = (typeof MERCHANT_CATEGORIES)[number];

export interface MerchantMatch {
  merchantId: Types.ObjectId;
  confidence: number;
  source: string;
}
