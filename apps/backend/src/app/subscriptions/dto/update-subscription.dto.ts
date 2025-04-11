import { IsString, IsNumber, IsDate, IsOptional, IsEnum, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { CreateSubscriptionDto } from './create-subscription.dto';

export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto) {
  @IsString()
  @IsOptional()
  cancellationReason?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  cancellationDate?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  pauseDate?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  resumeDate?: Date;
} 