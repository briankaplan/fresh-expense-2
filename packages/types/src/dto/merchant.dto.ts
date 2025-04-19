import { IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MerchantLocationDto {
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
}

export class MerchantMetadataDto {
  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => MerchantLocationDto)
  location?: MerchantLocationDto;
}

export class CreateMerchantDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => MerchantMetadataDto)
  metadata?: MerchantMetadataDto;
}

export class UpdateMerchantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => MerchantMetadataDto)
  metadata?: MerchantMetadataDto;
}
