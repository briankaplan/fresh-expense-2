import { User } from "@fresh-expense/types";
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";

import type { NotificationService } from "./notification.service";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";

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
