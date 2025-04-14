import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationSchema } from '../database/schemas/notification.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@CurrentUser('id') userId: string): Promise<NotificationSchema[]> {
    return this.notificationService.getNotifications(userId);
  }

  @Get('unread')
  async getUnreadNotifications(@CurrentUser('id') userId: string): Promise<NotificationSchema[]> {
    return this.notificationService.getUnreadNotifications(userId);
  }

  @Get('unread/count')
  async getUnreadCount(@CurrentUser('id') userId: string): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Post()
  async createNotification(
    @CurrentUser('id') userId: string,
    @Body() createNotificationDto: CreateNotificationDto
  ): Promise<NotificationSchema> {
    return this.notificationService.createNotification({
      ...createNotificationDto,
      userId,
    });
  }

  @Put(':id/read')
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') notificationId: string
  ): Promise<{ success: boolean }> {
    const success = await this.notificationService.markAsRead(notificationId);
    return { success };
  }

  @Put('read-all')
  async markAllAsRead(@CurrentUser('id') userId: string): Promise<{ success: boolean }> {
    const success = await this.notificationService.markAllAsRead(userId);
    return { success };
  }

  @Put(':id/archive')
  async archiveNotification(
    @CurrentUser('id') userId: string,
    @Param('id') notificationId: string
  ): Promise<{ success: boolean }> {
    const success = await this.notificationService.archiveNotification(notificationId);
    return { success };
  }

  @Get('recent')
  async getRecentNotifications(
    @CurrentUser('id') userId: string,
    @Param('limit') limit?: number
  ): Promise<NotificationSchema[]> {
    return this.notificationService.getRecentNotifications(userId, limit);
  }
} 