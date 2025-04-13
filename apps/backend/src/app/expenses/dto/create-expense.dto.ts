import { IsNotEmpty, IsNumber, IsDate, IsString, IsOptional, IsArray, IsMongoId, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REIMBURSED = 'reimbursed'
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  OTHER = 'other'
}

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsMongoId()
  userId!: string;

  @IsNotEmpty()
  @IsMongoId()
  companyId!: string;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date!: Date;

  @IsNotEmpty()
  @IsMongoId()
  merchantId!: string;

  @IsNotEmpty()
  @IsMongoId()
  categoryId!: string;

  @IsNotEmpty()
  @IsString()
  currency!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  tags?: string[];

  @IsOptional()
  @IsMongoId()
  receiptId?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsNotEmpty()
  @IsEnum(ExpenseStatus)
  status!: ExpenseStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  location?: {
    address: string;
    coordinates: number[];
  };

  @IsOptional()
  metadata?: {
    originalAmount?: number;
    originalCurrency?: string;
    exchangeRate?: number;
    isRecurring?: boolean;
    subscriptionId?: string;
  };
} 