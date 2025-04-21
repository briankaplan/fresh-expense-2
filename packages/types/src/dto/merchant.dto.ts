import { Type } from "class-transformer";
import { IsObject, IsOptional, IsString, ValidateNested } from "class-validator";

export class MerchantLocationDto {
  @IsString()
  @IsOptional()
  public address?: string;

  @IsString()
  @IsOptional()
  public city?: string;

  @IsString()
  @IsOptional()
  public state?: string;

  @IsString()
  @IsOptional()
  public country?: string;

  @IsString()
  @IsOptional()
  public postalCode?: string;
}

export class MerchantMetadataDto {
  @IsString()
  @IsOptional()
  public website?: string;

  @IsString()
  @IsOptional()
  public phone?: string;

  @IsString()
  @IsOptional()
  public email?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => MerchantLocationDto)
  public location?: MerchantLocationDto;
}

export class CreateMerchantDto {
  public name!: string;
  public category!: string;
  public metadata?: Record<string, unknown>;
}

export class UpdateMerchantDto {
  public name!: string;
  public category!: string;
  public metadata?: Record<string, unknown>;
}
