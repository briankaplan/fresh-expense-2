import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationController } from './notification.controller';
import { Notification, NotificationSchema } from './notification.schema';
import { NotificationService } from './notification.service';


export class NotificationModule {}
