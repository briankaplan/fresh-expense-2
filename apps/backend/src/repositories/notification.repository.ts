import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { Notification, type NotificationDocument } from "../models/notification.model";

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(notification: Partial<Notification>): Promise<NotificationDocument> {
    return this.notificationModel.create(notification);
  }

  async findUnreadByUserId(userId: string): Promise<NotificationDocument[]> {
    return this.notificationModel.find({ userId, read: false }).sort({ createdAt: -1 }).exec();
  }

  async markAsRead(id: string): Promise<NotificationDocument | null> {
    return this.notificationModel.findByIdAndUpdate(id, { read: true }, { new: true }).exec();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany({ userId, read: false }, { read: true }).exec();
  }
}
