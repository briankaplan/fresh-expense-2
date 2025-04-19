import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import type { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import type { UpdateSubscriptionDto } from "./dto/update-subscription.dto";
import type { SubscriptionsService } from "./subscriptions.service";

export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  findAll(@Query() query: any) {
    return this.subscriptionsService.findAll(query);
  }

  findOne(@Param("id") id: string) {
    return this.subscriptionsService.findOne(id);
  }

  update(@Param("id") id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  remove(@Param("id") id: string) {
    return this.subscriptionsService.remove(id);
  }

  findByUserId(@Param("userId") userId: string) {
    return this.subscriptionsService.findByUserId(userId);
  }

  findByCompanyId(@Param("companyId") companyId: string) {
    return this.subscriptionsService.findByCompanyId(companyId);
  }

  findByMerchantId(@Param("merchantId") merchantId: string) {
    return this.subscriptionsService.findByMerchantId(merchantId);
  }

  cancelSubscription(@Param("id") id: string, @Body("reason") reason: string) {
    return this.subscriptionsService.cancelSubscription(id, reason);
  }

  pauseSubscription(@Param("id") id: string) {
    return this.subscriptionsService.pauseSubscription(id);
  }

  resumeSubscription(@Param("id") id: string) {
    return this.subscriptionsService.resumeSubscription(id);
  }
}
