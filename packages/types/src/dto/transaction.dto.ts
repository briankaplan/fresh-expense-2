// External modules
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsObject,
} from "class-validator";

// Internal modules
import { TransactionStatus, TransactionType, TransactionSource } from "../constants/transaction.constants";
import type { Transaction, TransactionAmount, TransactionMerchant } from "../interfaces/transaction.interface";

export class TransactionAmountDto implements TransactionAmount {
  @IsNumber()
  public value!: number;

  @IsString()
  public currency!: string;
}

export class TransactionLocationDto {
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

  @IsOptional()
  public coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export class TransactionMerchantDto implements TransactionMerchant {
  @IsString()
  public name!: string;

  @IsString()
  @IsOptional()
  public category?: string;

  @IsString()
  @IsOptional()
  public website?: string;

  @IsString()
  @IsOptional()
  public logo?: string;
}

export class TransactionMetadataDto {
  @IsString()
  public source!: string;

  @IsString()
  @IsOptional()
  public originalId?: string;

  @IsObject()
  @IsOptional()
  public rawData?: Record<string, any>;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  public processedAt?: Date;

  @IsNumber()
  @IsOptional()
  public confidence?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  public tags?: string[];

  @IsString()
  @IsOptional()
  public notes?: string;
}

export class CreateTransactionDto {
  @IsString()
  public userId!: string;

  @IsString()
  public accountId!: string;

  @IsString()
  public merchantName!: string;

  @IsNumber()
  public amount!: number;

  @IsDate()
  @Type(() => Date)
  public date!: Date;

  @IsString()
  public description!: string;

  @IsEnum(TransactionType)
  public type!: TransactionType;

  @IsEnum(TransactionStatus)
  public status!: TransactionStatus;

  @IsEnum(TransactionSource)
  public source!: TransactionSource;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  public tags?: string[];

  @IsString()
  @IsOptional()
  public category?: string;

  @IsString()
  @IsOptional()
  public subscriptionId?: string;

  @ValidateNested()
  @Type(() => TransactionMetadataDto)
  @IsOptional()
  public metadata?: TransactionMetadataDto;
}

export class UpdateTransactionDto {
  @IsString()
  @IsOptional()
  public userId?: string;

  @IsString()
  @IsOptional()
  public accountId?: string;

  @IsString()
  @IsOptional()
  public merchantName?: string;

  @IsNumber()
  @IsOptional()
  public amount?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  public date?: Date;

  @IsString()
  @IsOptional()
  public description?: string;

  @IsEnum(TransactionType)
  @IsOptional()
  public type?: TransactionType;

  @IsEnum(TransactionStatus)
  @IsOptional()
  public status?: TransactionStatus;

  @IsEnum(TransactionSource)
  @IsOptional()
  public source?: TransactionSource;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  public tags?: string[];

  @IsString()
  @IsOptional()
  public category?: string;

  @IsString()
  @IsOptional()
  public subscriptionId?: string;

  @ValidateNested()
  @Type(() => TransactionMetadataDto)
  @IsOptional()
  public metadata?: TransactionMetadataDto;
}

export class TransactionQueryDto {
  public startDate?: Date;
  public endDate?: Date;
  public minAmount?: number;
  public maxAmount?: number;
  public categories?: string[];
  public merchants?: string[];
  public types?: string[];
  public statuses?: string[];
  public sources?: string[];
  public tags?: string[];
  public search?: string;
  public page?: number;
  public limit?: number;
  public sortBy?: string;
  public sortOrder?: 'asc' | 'desc';
}

export class AICategorizationResultDto {
  @IsString()
  public category!: string;

  @IsEnum(["Down Home", "Music City Rodeo", "Personal"])
  public company!: "Down Home" | "Music City Rodeo" | "Personal";

  @IsArray()
  @IsString({ each: true })
  public tags!: string[];

  @IsNumber()
  public confidence!: number;

  @IsString()
  public description!: string;
}

export class BulkUpdateTransactionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTransactionDto)
  public transactions!: UpdateTransactionDto[];
}

export class AICategorizationRequestDto {
  @IsArray()
  @IsString({ each: true })
  public transactionIds!: string[];

  @IsOptional()
  @IsBoolean()
  public forceUpdate?: boolean;

  @IsOptional()
  @IsNumber()
  public confidenceThreshold?: number;
}

export class AICategorizationResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AICategorizedTransactionDto)
  public results!: AICategorizedTransactionDto[];

  @IsNumber()
  public totalProcessed!: number;

  @IsNumber()
  public totalUpdated!: number;

  @IsNumber()
  public averageConfidence!: number;
}

export class AICategorizedTransactionDto {
  @IsString()
  public transactionId!: string;

  @ValidateNested()
  @Type(() => AICategorizationResultDto)
  public categorization!: AICategorizationResultDto;

  @IsBoolean()
  public wasUpdated!: boolean;

  @IsOptional()
  @IsString()
  public error?: string;
}

export class TransactionBatchUpdateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionUpdateDto)
  public updates!: TransactionUpdateDto[];
}

export class TransactionUpdateDto {
  @IsString()
  public transactionId!: string;

  @IsOptional()
  @IsString()
  public category?: string;

  @IsOptional()
  @IsEnum(["Down Home", "Music City Rodeo", "Personal"])
  public company?: "Down Home" | "Music City Rodeo" | "Personal";

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public tags?: string[];

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsNumber()
  public confidence?: number;
}
