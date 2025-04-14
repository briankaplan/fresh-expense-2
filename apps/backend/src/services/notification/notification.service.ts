import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationRepository } from '../database/repositories/notification.repository';
import { NotificationSchema } from '../database/schemas/notification.schema';

export interface Notification {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async notify(notification: Omit<Notification, 'timestamp'>): Promise<void> {
    const fullNotification: Notification = {
      ...notification,
      timestamp: new Date(),
    };

    try {
      // Emit event for real-time notifications
      this.eventEmitter.emit('notification.created', fullNotification);

      // Log based on type
      switch (notification.type) {
        case 'error':
          this.logger.error(`${notification.title}: ${notification.message}`, notification.metadata);
          break;
        case 'warning':
          this.logger.warn(`${notification.title}: ${notification.message}`, notification.metadata);
          break;
        case 'info':
          this.logger.log(`${notification.title}: ${notification.message}`, notification.metadata);
          break;
        case 'success':
          this.logger.log(`${notification.title}: ${notification.message}`, notification.metadata);
          break;
      }

      // TODO: Add email notifications if configured
      if (this.configService.get<boolean>('NOTIFICATIONS_EMAIL_ENABLED')) {
        // Implement email notification logic
      }

    } catch (error) {
      this.logger.error('Error sending notification:', error);
      // Don't throw to prevent breaking the main flow
    }
  }

  async notifyError(error: Error, context?: string): Promise<void> {
    await this.notify({
      type: 'error',
      title: context || 'Error',
      message: error.message,
      metadata: {
        stack: error.stack,
        context,
      },
    });
  }

  async notifySuccess(title: string, message: string): Promise<void> {
    await this.notify({
      type: 'success',
      title,
      message,
    });
  }

  async notifyInfo(title: string, message: string): Promise<void> {
    await this.notify({
      type: 'info',
      title,
      message,
    });
  }

  async notifyWarning(title: string, message: string): Promise<void> {
    await this.notify({
      type: 'warning',
      title,
      message,
    });
  }

  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationSchema['type'];
    priority?: NotificationSchema['priority'];
    action?: NotificationSchema['action'];
    metadata?: Record<string, any>;
  }): Promise<NotificationSchema> {
    return this.notificationRepository.createNotification({
      ...data,
      priority: data.priority || 'medium',
      status: 'unread',
    });
  }

  async getNotifications(userId: string): Promise<NotificationSchema[]> {
    return this.notificationRepository.findByUserId(userId);
  }

  async getUnreadNotifications(userId: string): Promise<NotificationSchema[]> {
    return this.notificationRepository.findByStatus(userId, 'unread');
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.getUnreadCount(userId);
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    return this.notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    return this.notificationRepository.markAllAsRead(userId);
  }

  async archiveNotification(notificationId: string): Promise<boolean> {
    return this.notificationRepository.archiveNotification(notificationId);
  }

  async getRecentNotifications(userId: string, limit?: number): Promise<NotificationSchema[]> {
    return this.notificationRepository.getRecentNotifications(userId, limit);
  }
} 