import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import {
    IsString,
    IsNumber,
    IsOptional,
    IsEnum,
    IsBoolean,
    IsDate,
    ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TransactionType } from '@fresh-expense/types';
import { User } from '@fresh-expense/types';
import { Category } from '@fresh-expense/types';

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Transaction {
    @ApiProperty({ type: String, description: 'Transaction ID' })
    @Prop({ type: MongooseSchema.Types.ObjectId })
    _id: Types.ObjectId;

    @ApiProperty({ type: String, description: 'User ID' })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @ApiProperty({ enum: TransactionType, description: 'Transaction type' })
    @IsEnum(TransactionType)
    @Prop({ type: String, enum: TransactionType, default: TransactionType.EXPENSE })
    type: TransactionType;

    @ApiProperty({ type: Number, description: 'Transaction amount' })
    @IsNumber()
    @Prop({ type: Number, required: true })
    amount: number;

    @ApiPropertyOptional({ type: String, description: 'Category ID' })
    @IsOptional()
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
    categoryId?: Types.ObjectId;

    @ApiProperty({ type: Boolean, description: 'Whether the transaction is recurring' })
    @IsBoolean()
    @Prop({ type: Boolean, default: false })
    isRecurring: boolean;

    @ApiPropertyOptional({ type: String, description: 'Transaction notes' })
    @IsOptional()
    @IsString()
    @Prop({ type: String })
    notes?: string;

    @ApiProperty({ type: Date, description: 'Transaction date' })
    @IsDate()
    @Type(() => Date)
    @Prop({ type: Date, required: true })
    date: Date;

    @Prop({
        type: {
            isRecurring: { type: Boolean, default: false },
            frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
            endDate: { type: Date },
            nextOccurrence: { type: Date }
        },
        default: { isRecurring: false }
    })
    recurring: {
        isRecurring: boolean;
        frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
        endDate?: Date;
        nextOccurrence?: Date;
    };

    @Prop({
        type: [{
            amount: { type: Number, required: true },
            categoryId: { type: MongooseSchema.Types.ObjectId, ref: 'Category', required: true },
            description: { type: String }
        }]
    })
    splitTransactions?: Array<{
        amount: number;
        categoryId: Types.ObjectId;
        description?: string;
    }>;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;

    // Virtual fields
    id: string;
}

// Type for service injection/use
export type TransactionDocument = HydratedDocument<Transaction>;

// Schema instance
export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// 👇 Virtuals for Population
TransactionSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});

TransactionSchema.virtual('category', {
    ref: 'Category',
    localField: 'categoryId',
    foreignField: '_id',
    justOne: true,
});

// 👇 Custom toJSON Behavior
TransactionSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
    },
});

// 👇 Single Field Indexes
TransactionSchema.index({ userId: 1 });
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ categoryId: 1 });

// 👇 Compound Indexes
TransactionSchema.index({ userId: 1, date: -1 }); // For date range queries by user
TransactionSchema.index({ userId: 1, type: 1 }); // For filtering by type
TransactionSchema.index({ userId: 1, categoryId: 1 }); // For category-based queries
TransactionSchema.index({ userId: 1, isRecurring: 1 }); // For recurring transaction queries

TransactionSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

TransactionSchema.virtual('recurring.isRecurring').get(function () {
    return this.isRecurring;
});

TransactionSchema.virtual('recurring.frequency').get(function () {
    return this.recurring?.frequency;
});

TransactionSchema.virtual('recurring.endDate').get(function () {
    return this.recurring?.endDate;
}); 