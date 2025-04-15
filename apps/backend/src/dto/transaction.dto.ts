import { IsString, IsNumber, IsDate, IsBoolean, IsOptional, IsArray, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class TransactionDto {
  @IsString()
  externalId!: string;

  @IsString()
  accountId!: string;

  @Type(() => Date)
  @IsDate()
  date!: Date;

  @IsString()
  description!: string;

  @IsNumber()
  amount!: number;

  @IsEnum(['debit', 'credit'])
  type!: string;

  @IsEnum(['pending', 'posted', 'canceled'])
  status!: string;

  @IsArray()
  @IsString({ each: true })
  category!: string[];

  @IsString()
  @IsEnum(['processed', 'pending', 'failed'])
  processingStatus!: string;

  @IsNumber()
  runningBalance!: number;

  @IsString()
  source!: string;

  @Type(() => Date)
  @IsDate()
  lastUpdated!: Date;

  @IsOptional()
  @IsString()
  merchantName?: string;

  @IsOptional()
  @IsString()
  merchantCategory?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsBoolean()
  isRecurring!: boolean;

  @IsObject()
  originalPayload!: Record<string, any>;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  clearedDate?: Date;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}

export class TransactionQueryDto {
  @IsString()
  @IsOptional()
  accountId?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  minAmount?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxAmount?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number = 100;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  offset?: number = 0;

  @IsString()
  @IsOptional()
  merchantName?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;
} 