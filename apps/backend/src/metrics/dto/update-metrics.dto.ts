import { IsString, IsNumber, IsEnum, IsOptional, IsDate, IsObject } from 'class-validator';
import { MetricType } from '@fresh-expense/types';

export class UpdateMetricsDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsEnum(MetricType)
  @IsOptional()
  type?: MetricType;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsObject()
  @IsOptional()
  metadata?: {
    category?: string;
    description?: string;
    [key: string]: any;
  };

  @IsDate()
  @IsOptional()
  timestamp?: Date;
}
