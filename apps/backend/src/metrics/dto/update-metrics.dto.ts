import { MetricType } from "@fresh-expense/types";
import { IsDate, IsEnum, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

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
