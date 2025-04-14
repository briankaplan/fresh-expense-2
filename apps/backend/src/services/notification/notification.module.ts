import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationRepository } from '../database/repositories/notification.repository';
import { MongoDBModule } from '../database/mongodb.module';

@Module({
  imports: [MongoDBModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository],
  exports: [NotificationService],
})
export class NotificationModule {} 