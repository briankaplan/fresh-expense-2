import {
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReceiptDto {
  @IsString()
  userId!: string;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  merchantName!: string;

  @IsNumber()
  amount!: number;

  @Type(() => Date)
  @IsDate()
  date!: Date;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags: string[] = [];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  fullImageUrl?: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsEnum(['pending', 'processed', 'failed'])
  @IsOptional()
  processingStatus: string = 'pending';

  @IsNumber()
  @IsOptional()
  version: number = 1;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  importDate?: Date;

  @IsObject()
  @IsOptional()
  metadata: Record<string, any> = {};

  @IsBoolean()
  @IsOptional()
  isRecurring: boolean = false;

  @IsString()
  @IsOptional()
  merchantCategory?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
