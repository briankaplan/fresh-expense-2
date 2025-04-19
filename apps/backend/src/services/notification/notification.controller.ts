import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationSchema } from '@/core/database/schemas/notification.schema';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { CreateNotificationDto } from './dto/create-notification.dto';




export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  
  async getNotifications(@CurrentUser('id') userId: string): Promise<NotificationSchema[]> {
    return this.notificationService.getNotifications(userId);
  }

  
  async getUnreadNotifications(@CurrentUser('id') userId: string): Promise<NotificationSchema[]> {
    return this.notificationService.getUnreadNotifications(userId);
  }

  
  async getUnreadCount(@CurrentUser('id') userId: string): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  
  async createNotification(
    @CurrentUser('id') userId: string,
    @Body() createNotificationDto: CreateNotificationDto
  ): Promise<NotificationSchema> {
    return this.notificationService.createNotification({
      ...createNotificationDto,
      userId,
    });
  }

  
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') notificationId: string
  ): Promise<{ success: boolean }> {
    const success = await this.notificationService.markAsRead(notificationId);
    return { success };
  }

  
  async markAllAsRead(@CurrentUser('id') userId: string): Promise<{ success: boolean }> {
    const success = await this.notificationService.markAllAsRead(userId);
    return { success };
  }

  
  async archiveNotification(
    @CurrentUser('id') userId: string,
    @Param('id') notificationId: string
  ): Promise<{ success: boolean }> {
    const success = await this.notificationService.archiveNotification(notificationId);
    return { success };
  }

  
  async getRecentNotifications(
    @CurrentUser('id') userId: string,
    @Param('limit') limit?: number
  ): Promise<NotificationSchema[]> {
    return this.notificationService.getRecentNotifications(userId, limit);
  }
}
