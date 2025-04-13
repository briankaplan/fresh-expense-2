import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDate, IsNumber, IsBoolean, IsMongoId, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionStatus, BillingCycle } from '../schemas/subscription.schema';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsMongoId()
  userId!: string;

  @IsNotEmpty()
  @IsMongoId()
  companyId!: string;

  @IsNotEmpty()
  @IsMongoId()
  merchantId!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsString()
  currency!: string;

  @IsNotEmpty()
  @IsEnum(BillingCycle)
  billingCycle!: BillingCycle;

  @IsOptional()
  @IsNumber()
  customBillingDays?: number;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate!: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsNotEmpty()
  @IsEnum(SubscriptionStatus)
  status!: SubscriptionStatus;

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

  @IsNotEmpty()
  @IsString()
  paymentMethodId!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
} 