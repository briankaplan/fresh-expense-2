import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

import type { NotificationSchema } from "../../database/schemas/notification.schema";

export class CreateNotificationDto {
  @ApiProperty({ description: "Title of the notification", maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title!: string;

  @ApiProperty({
    description: "Message content of the notification",
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message!: string;

  @ApiProperty({
    description: "Type of notification",
    enum: ["info", "warning", "error", "success"],
  })
  @IsEnum(["info", "warning", "error", "success"])
  type!: NotificationSchema["type"];

  @ApiPropertyOptional({
    description: "Priority level of the notification",
    enum: ["low", "medium", "high"],
    default: "medium",
  })
  @IsEnum(["low", "medium", "high"])
  @IsOptional()
  priority?: NotificationSchema["priority"];

  @ApiPropertyOptional({
    description: "Action associated with the notification",
    example: { type: "link", data: { url: "https://example.com" } },
  })
  @IsObject()
  @IsOptional()
  action?: {
    type: string;
    data: Record<string, any>;
  };

  @ApiPropertyOptional({
    description: "Additional metadata for the notification",
    example: { category: "billing", referenceId: "12345" },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
