import type { Transaction, TransactionAmount, TransactionMerchant } from "@fresh-expense/types";
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
} from "class-validator";

export class TransactionAmountDto implements TransactionAmount {
  @IsNumber()
  value!: number;

  @IsString()
  currency!: string;
}

export class TransactionLocationDto {
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

  @IsOptional()
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export class TransactionMerchantDto implements TransactionMerchant {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsString()
  @IsOptional()
  logo?: string;
}

export class TransactionMetadataDto {
  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsString()
  @IsOptional()
  receiptId?: string;

  @IsString()
  @IsOptional()
  subscriptionId?: string;

  @ValidateNested()
  @Type(() => TransactionLocationDto)
  @IsOptional()
  location?: TransactionLocationDto;
}

export class CreateTransactionDto {
  @IsString()
  userId!: string;

  @IsString()
  accountId!: string;

  @IsString()
  merchantName!: string;

  @IsNumber()
  amount!: number;

  @IsDate()
  @Type(() => Date)
  date!: Date;

  @IsString()
  description!: string;

  @IsEnum(["debit", "credit"])
  type!: "debit" | "credit";

  @IsEnum(["pending", "posted", "cancelled"])
  status!: "pending" | "posted" | "cancelled";

  @IsEnum(["Down Home", "Music City Rodeo", "Personal"])
  company!: "Down Home" | "Music City Rodeo" | "Personal";

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  subscriptionId?: string;

  @ValidateNested()
  @Type(() => TransactionMetadataDto)
  @IsOptional()
  metadata?: TransactionMetadataDto;
}

export class UpdateTransactionDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  merchantName?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  date?: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(["debit", "credit"])
  @IsOptional()
  type?: "debit" | "credit";

  @IsEnum(["pending", "posted", "cancelled"])
  @IsOptional()
  status?: "pending" | "posted" | "cancelled";

  @IsEnum(["Down Home", "Music City Rodeo", "Personal"])
  @IsOptional()
  company?: "Down Home" | "Music City Rodeo" | "Personal";

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  subscriptionId?: string;

  @ValidateNested()
  @Type(() => TransactionMetadataDto)
  @IsOptional()
  metadata?: TransactionMetadataDto;
}

export class TransactionQueryDto {
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  categories?: string[];
  merchants?: string[];
  types?: ("expense" | "income" | "transfer")[];
  statuses?: ("pending" | "completed" | "cancelled")[];
  sources?: ("teller" | "manual" | "import")[];
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: keyof Transaction;
  sortOrder?: "asc" | "desc";
}

export class AICategorizationResultDto {
  @IsString()
  category!: string;

  @IsEnum(["Down Home", "Music City Rodeo", "Personal"])
  company!: "Down Home" | "Music City Rodeo" | "Personal";

  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @IsNumber()
  confidence!: number;

  @IsString()
  description!: string;
}

export class BulkUpdateTransactionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTransactionDto)
  transactions!: UpdateTransactionDto[];
}

export class AICategorizationRequestDto {
  @IsArray()
  @IsString({ each: true })
  transactionIds!: string[];

  @IsOptional()
  @IsBoolean()
  forceUpdate?: boolean;

  @IsOptional()
  @IsNumber()
  confidenceThreshold?: number;
}

export class AICategorizationResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AICategorizedTransactionDto)
  results!: AICategorizedTransactionDto[];

  @IsNumber()
  totalProcessed!: number;

  @IsNumber()
  totalUpdated!: number;

  @IsNumber()
  averageConfidence!: number;
}

export class AICategorizedTransactionDto {
  @IsString()
  transactionId!: string;

  @ValidateNested()
  @Type(() => AICategorizationResultDto)
  categorization!: AICategorizationResultDto;

  @IsBoolean()
  wasUpdated!: boolean;

  @IsOptional()
  @IsString()
  error?: string;
}

export class TransactionBatchUpdateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionUpdateDto)
  updates!: TransactionUpdateDto[];
}

export class TransactionUpdateDto {
  @IsString()
  transactionId!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(["Down Home", "Music City Rodeo", "Personal"])
  company?: "Down Home" | "Music City Rodeo" | "Personal";

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  confidence?: number;
}
