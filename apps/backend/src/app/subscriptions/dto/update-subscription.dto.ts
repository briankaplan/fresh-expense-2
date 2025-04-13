import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDate, IsNumber, IsBoolean, IsMongoId, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionStatus, BillingCycle } from '../schemas/subscription.schema';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsNotEmpty()
  @IsMongoId()
  companyId!: string;

  @IsOptional()
  @IsMongoId()
  merchantId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @IsOptional()
  @IsNumber()
  customBillingDays?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastBillingDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  nextBillingDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cancellationDate?: Date;

  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  trialEndDate?: Date;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
} 