import { IsString, IsNumber, IsDate, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionSchema } from '../../database/schemas/transaction.schema';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Amount of the transaction' })
  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({ description: 'Description of the transaction' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ description: 'Date of the transaction' })
  @IsDate()
  @IsNotEmpty()
  date!: Date;

  @ApiProperty({ description: 'Category of the transaction' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiPropertyOptional({ description: 'Type of transaction', enum: ['income', 'expense'] })
  @IsEnum(['income', 'expense'])
  @IsOptional()
  type?: TransactionSchema['type'];

  @ApiPropertyOptional({ description: 'Additional notes about the transaction' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Tags for the transaction' })
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Receipt URL or reference' })
  @IsString()
  @IsOptional()
  receipt?: string;
}
