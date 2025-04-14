import { BaseSchema } from './base.schema';

export interface CategorySchema extends BaseSchema {
  userId: string;
  name: string;
  description?: string;
  type: 'expense' | 'income' | 'both';
  color?: string;
  icon?: string;
  parentId?: string;
  isDefault: boolean;
  metadata?: {
    [key: string]: any;
  };
}

export const CATEGORY_COLLECTION = 'categories'; 