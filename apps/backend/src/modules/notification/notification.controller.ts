import { User } from "@fresh-expense/types";
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import type { NotificationService } from "./notification.service";

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  async getUnreadNotifications(@User("id") userId: string) {
    return this.notificationService.getUnreadNotifications(userId);
  }

  async markAsRead(@Param("id") notificationId: string) {
    return this.notificationService.markAsRead(notificationId);
  }

  async markAllAsRead(@User("id") userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  async archiveNotification(@Param("id") notificationId: string) {
    return this.notificationService.archiveNotification(notificationId);
  }
}
