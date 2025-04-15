import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionCategory, TRANSACTION_CATEGORIES } from '@packages/utils';

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
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

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
}
