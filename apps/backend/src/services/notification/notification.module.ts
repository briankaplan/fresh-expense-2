import { Module } from '@nestjs/common';

import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

import { MongoDBModule } from '@/core/database/mongodb.module';
import { NotificationRepository } from '@/core/database/repositories/notification.repository';


export class NotificationModule {}
