import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateBudgetDto {
  @ApiProperty({ description: "Category for the budget" })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({ description: "Budget amount" })
  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({ description: "Start date of the budget period" })
  @IsDate()
  @IsNotEmpty()
  startDate!: Date;

  @ApiProperty({ description: "End date of the budget period" })
  @IsDate()
  @IsNotEmpty()
  endDate!: Date;

  @ApiPropertyOptional({
    description: "Budget period",
    enum: ["daily", "weekly", "monthly", "yearly"],
    default: "monthly",
  })
  @IsEnum(["daily", "weekly", "monthly", "yearly"])
  @IsOptional()
  period?: string;

  @ApiPropertyOptional({ description: "Additional metadata" })
  @IsOptional()
  metadata?: Record<string, any>;
}
