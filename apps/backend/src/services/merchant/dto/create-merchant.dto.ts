import { IsString, IsOptional, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TransactionCategory } from '@packages/utils';

class LocationDto {
  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsArray()
  @IsOptional()
  coordinates?: [number, number];
}

export class CreateMerchantDto {
  @ApiProperty({ description: 'Name of the merchant' })
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Category of the merchant' })
  @IsString()
  @IsOptional()
  category?: TransactionCategory;

  @IsString()
  @IsOptional()
  tellerMerchantId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  @IsOptional()
  locations?: LocationDto[];

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Alternative names for the merchant' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  aliases?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
