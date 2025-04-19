import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { User } from '@fresh-expense/types';



export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  
  async getUnreadNotifications(@User('id') userId: string) {
    return this.notificationService.getUnreadNotifications(userId);
  }

  
  async markAsRead(@Param('id') notificationId: string) {
    return this.notificationService.markAsRead(notificationId);
  }

  
  async markAllAsRead(@User('id') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  
  async archiveNotification(@Param('id') notificationId: string) {
    return this.notificationService.archiveNotification(notificationId);
  }
}
