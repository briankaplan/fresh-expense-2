import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../repositories/notification.repository';
import { Notification, NotificationDocument } from '../models/notification.model';
import { Types } from 'mongoose';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async createNotification(
    userId: string,
    type: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<NotificationDocument> {
    return this.notificationRepository.create({
      userId: new Types.ObjectId(userId),
      type,
      message,
      metadata,
    });
  }

  async getUnreadNotifications(userId: string): Promise<NotificationDocument[]> {
    return this.notificationRepository.findUnreadByUserId(userId);
  }

  async markNotificationAsRead(id: string): Promise<NotificationDocument | null> {
    return this.notificationRepository.markAsRead(id);
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    return this.notificationRepository.markAllAsRead(userId);
  }
}
