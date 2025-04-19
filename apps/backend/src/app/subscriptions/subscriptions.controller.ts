import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';



export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  
  findAll(@Query() query: any) {
    return this.subscriptionsService.findAll(query);
  }

  
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  
  update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }

  
  findByUserId(@Param('userId') userId: string) {
    return this.subscriptionsService.findByUserId(userId);
  }

  
  findByCompanyId(@Param('companyId') companyId: string) {
    return this.subscriptionsService.findByCompanyId(companyId);
  }

  
  findByMerchantId(@Param('merchantId') merchantId: string) {
    return this.subscriptionsService.findByMerchantId(merchantId);
  }

  
  cancelSubscription(@Param('id') id: string, @Body('reason') reason: string) {
    return this.subscriptionsService.cancelSubscription(id, reason);
  }

  
  pauseSubscription(@Param('id') id: string) {
    return this.subscriptionsService.pauseSubscription(id);
  }

  
  resumeSubscription(@Param('id') id: string) {
    return this.subscriptionsService.resumeSubscription(id);
  }
}
