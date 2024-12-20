'use client';

import { BaseService, BaseServiceError } from '../db/baseService';

export interface NotificationPayload {
  type: 'receipt' | 'transaction' | 'match' | 'error';
  title: string;
  message: string;
  data?: Record<string, any>;
  userId?: string;
}

export class NotificationService extends BaseService {
  private subscribers: Map<string, Set<(payload: NotificationPayload) => void>> = new Map();

  async notify(payload: NotificationPayload): Promise<void> {
    try {
      // Store notification in database
      await this.db.notification.create({
        data: {
          type: payload.type,
          title: payload.title,
          message: payload.message,
          data: payload.data,
          userId: payload.userId,
          createdAt: new Date()
        }
      });

      // Notify subscribers
      const subscribers = this.subscribers.get(payload.userId || 'global') || new Set();
      subscribers.forEach(callback => callback(payload));

      this.logger.info('Notification sent', { payload });
    } catch (error) {
      this.logger.error('Failed to send notification', { error, payload });
      throw new BaseServiceError(
        'Failed to send notification',
        'NOTIFICATION_FAILED',
        error
      );
    }
  }

  subscribe(
    callback: (payload: NotificationPayload) => void,
    userId?: string
  ): () => void {
    const key = userId || 'global';
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    return () => {
      this.subscribers.get(key)?.delete(callback);
    };
  }
} 