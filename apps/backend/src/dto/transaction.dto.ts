import { IsString, IsNumber, IsDate, IsOptional, IsEnum, IsArray, IsBoolean, IsObject } from 'class-validator';
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
  @IsOptional()
  category: string[] = [];

  @IsEnum(['processed', 'pending', 'failed'])
  @IsOptional()
  processingStatus: string = 'processed';

  @IsNumber()
  @IsOptional()
  runningBalance?: number;

  @IsString()
  source!: string;

  @Type(() => Date)
  @IsDate()
  lastUpdated!: Date;

  @IsString()
  @IsOptional()
  matchedReceiptId?: string;

  @IsOptional()
  @IsObject()
  metadata: Record<string, any> = {};

  @IsOptional()
  @IsObject()
  originalPayload: Record<string, any> = {};

  @IsString()
  @IsOptional()
  merchantName?: string;

  @IsString()
  @IsOptional()
  merchantCategory?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring: boolean = false;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  clearedDate?: Date;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  fullImageUrl?: string;

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