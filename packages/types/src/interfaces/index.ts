import { Types } from 'mongoose';

// Common interfaces
export interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isDeleted?: boolean;
}

export interface UserOwned {
  userId: Types.ObjectId | string;
}

export interface CompanyOwned {
  companyId: Types.ObjectId | string;
}

export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDelete {
  deletedAt?: Date;
  isDeleted: boolean;
}

export interface Metadata {
  [key: string]: any;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export * from './receipt';
