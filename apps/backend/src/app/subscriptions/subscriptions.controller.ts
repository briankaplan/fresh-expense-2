import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.subscriptionsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.subscriptionsService.findByUserId(userId);
  }

  @Get('company/:companyId')
  findByCompanyId(@Param('companyId') companyId: string) {
    return this.subscriptionsService.findByCompanyId(companyId);
  }

  @Get('merchant/:merchantId')
  findByMerchantId(@Param('merchantId') merchantId: string) {
    return this.subscriptionsService.findByMerchantId(merchantId);
  }

  @Post(':id/cancel')
  cancelSubscription(@Param('id') id: string, @Body('reason') reason: string) {
    return this.subscriptionsService.cancelSubscription(id, reason);
  }

  @Post(':id/pause')
  pauseSubscription(@Param('id') id: string) {
    return this.subscriptionsService.pauseSubscription(id);
  }

  @Post(':id/resume')
  resumeSubscription(@Param('id') id: string) {
    return this.subscriptionsService.resumeSubscription(id);
  }
} 