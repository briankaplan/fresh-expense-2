import { IsString, IsNumber, IsEnum, IsOptional, IsDate, IsObject } from 'class-validator';
import { MetricType } from '@fresh-expense/types';

export class CreateMetricsDto {
  @IsString()
  userId!: string;

  @IsEnum(MetricType)
  type!: MetricType;

  @IsNumber()
  value!: number;

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
