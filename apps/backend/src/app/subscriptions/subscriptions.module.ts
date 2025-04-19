import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';


export class SubscriptionsModule {}
