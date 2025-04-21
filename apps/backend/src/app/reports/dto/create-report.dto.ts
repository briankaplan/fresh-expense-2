import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

import { ReportFormat, ReportType } from "../schemas/report.schema";

class ScheduleDto {
  @IsNotEmpty()
  @IsString()
  frequency!: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

  @IsOptional()
  @IsString()
  dayOfWeek?: string;

  @IsOptional()
  @IsString()
  dayOfMonth?: string;

  @IsOptional()
  @IsString()
  timeOfDay?: string;
}

export class CreateReportDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsString()
  companyId!: string;

  @IsNotEmpty()
  @IsEnum(ReportType)
  type!: ReportType;

  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate!: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate!: Date;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsNotEmpty()
  @IsEnum(ReportFormat)
  format!: ReportFormat;

  @IsOptional()
  @IsBoolean()
  isScheduled?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleDto)
  schedule?: ScheduleDto;
}
