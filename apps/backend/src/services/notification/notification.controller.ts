import type { NotificationSchema } from "@/core/database/schemas/notification.schema";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import type { CreateNotificationDto } from "./dto/create-notification.dto";
import type { NotificationService } from "./notification.service";

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  async getNotifications(@CurrentUser("id") userId: string): Promise<NotificationSchema[]> {
    return this.notificationService.getNotifications(userId);
  }

  async getUnreadNotifications(@CurrentUser("id") userId: string): Promise<NotificationSchema[]> {
    return this.notificationService.getUnreadNotifications(userId);
  }

  async getUnreadCount(@CurrentUser("id") userId: string): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  async createNotification(
    @CurrentUser("id") userId: string,
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationSchema> {
    return this.notificationService.createNotification({
      ...createNotificationDto,
      userId,
    });
  }

  async markAsRead(
    @CurrentUser("id") userId: string,
    @Param("id") notificationId: string,
  ): Promise<{ success: boolean }> {
    const success = await this.notificationService.markAsRead(notificationId);
    return { success };
  }

  async markAllAsRead(@CurrentUser("id") userId: string): Promise<{ success: boolean }> {
    const success = await this.notificationService.markAllAsRead(userId);
    return { success };
  }

  async archiveNotification(
    @CurrentUser("id") userId: string,
    @Param("id") notificationId: string,
  ): Promise<{ success: boolean }> {
    const success = await this.notificationService.archiveNotification(notificationId);
    return { success };
  }

  async getRecentNotifications(
    @CurrentUser("id") userId: string,
    @Param("limit") limit?: number,
  ): Promise<NotificationSchema[]> {
    return this.notificationService.getRecentNotifications(userId, limit);
  }
}
