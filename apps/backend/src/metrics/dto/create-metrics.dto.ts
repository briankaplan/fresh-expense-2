import { MetricType } from "@fresh-expense/types";
import { IsDate, IsEnum, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

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
