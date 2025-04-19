import type { NotificationRepository } from "@/core/database/repositories/notification.repository";
import type { NotificationSchema } from "@/core/database/schemas/notification.schema";
import { Injectable, Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { Notification, type NotificationDocument } from "../../models/notification.model";

export interface Notification {
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface MatchNotification {
  receiptId: string;
  transactionId: string;
  confidence: number;
  merchant: string;
  amount: number;
  date: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationRepository: NotificationRepository,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async notify(notification: Omit<Notification, "timestamp">): Promise<void> {
    const fullNotification: Notification = {
      ...notification,
      timestamp: new Date(),
    };

    try {
      // Emit event for real-time notifications
      this.eventEmitter.emit("notification.created", fullNotification);

      // Log based on type
      switch (notification.type) {
        case "error":
          this.logger.error(
            `${notification.title}: ${notification.message}`,
            notification.metadata,
          );
          break;
        case "warning":
          this.logger.warn(`${notification.title}: ${notification.message}`, notification.metadata);
          break;
        case "info":
          this.logger.log(`${notification.title}: ${notification.message}`, notification.metadata);
          break;
        case "success":
          this.logger.log(`${notification.title}: ${notification.message}`, notification.metadata);
          break;
      }

      // TODO: Add email notifications if configured
      if (this.configService.get<boolean>("NOTIFICATIONS_EMAIL_ENABLED")) {
        // Implement email notification logic
      }
    } catch (error) {
      this.logger.error("Error sending notification:", error);
      // Don't throw to prevent breaking the main flow
    }
  }

  async notifyError(error: Error, context?: string): Promise<void> {
    await this.notify({
      type: "error",
      title: context || "Error",
      message: error.message,
      metadata: {
        stack: error.stack,
        context,
      },
    });
  }

  async notifySuccess(title: string, message: string): Promise<void> {
    await this.notify({
      type: "success",
      title,
      message,
    });
  }

  async notifyInfo(title: string, message: string): Promise<void> {
    await this.notify({
      type: "info",
      title,
      message,
    });
  }

  async notifyWarning(title: string, message: string): Promise<void> {
    await this.notify({
      type: "warning",
      title,
      message,
    });
  }

  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationSchema["type"];
    priority?: NotificationSchema["priority"];
    action?: NotificationSchema["action"];
    metadata?: Record<string, any>;
  }): Promise<NotificationSchema> {
    return this.notificationRepository.createNotification({
      ...data,
      priority: data.priority || "medium",
      status: "matched",
    });
  }

  async getNotifications(userId: string): Promise<NotificationSchema[]> {
    return this.notificationRepository.findByUserId(userId);
  }

  async getUnreadNotifications(userId: string): Promise<NotificationSchema[]> {
    return this.notificationRepository.findByStatus(userId, "unread");
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

  async sendMatchNotification(userId: string, data: MatchNotification): Promise<void> {
    try {
      this.logger.log(`Sending match notification for user ${userId}`);

      const notification = new this.notificationModel({
        userId,
        type: "receipt_match",
        data,
        read: false,
        createdAt: new Date(),
      });

      await notification.save();

      // TODO: Implement real-time notification delivery (e.g., WebSocket, push notification)
      this.logger.log(`Match notification created: ${notification._id}`);
    } catch (error) {
      this.logger.error("Error sending match notification:", error);
      throw error;
    }
  }

  async getUnreadNotifications(userId: string): Promise<NotificationDocument[]> {
    return this.notificationModel.find({ userId, read: false }).sort({ createdAt: -1 }).exec();
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationModel
      .updateOne({ _id: notificationId }, { $set: { read: true } })
      .exec();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel
      .updateMany({ userId, read: false }, { $set: { read: true } })
      .exec();
  }
}
