import { BaseSchema } from './base.schema';
import { ObjectId } from 'mongodb';

export interface NotificationSchema extends BaseSchema {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high';
  status: 'unread' | 'read' | 'archived';
  action?: {
    type: string;
    data: Record<string, any>;
  };
  metadata?: Record<string, any>;
}

export const NOTIFICATION_COLLECTION = 'notifications';
