import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ExpenseStatus, PaymentMethod } from '../dto/create-expense.dto';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Company' })
  companyId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  date!: Date;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Merchant' })
  merchantId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  categoryId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, default: 'USD' })
  currency!: string;

  @Prop({ required: true })
  description!: string;

  @Prop([String])
  tags?: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Receipt' })
  receiptId?: MongooseSchema.Types.ObjectId;

  @Prop()
  transactionId?: string;

  @Prop({ required: true, enum: ExpenseStatus, default: ExpenseStatus.PENDING })
  status!: ExpenseStatus;

  @Prop({ required: true, enum: PaymentMethod })
  paymentMethod!: PaymentMethod;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  })
  location!: {
    type: string;
    coordinates: number[];
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: 'expense' })
  type: 'income' | 'expense';

  @Prop()
  notes?: string;

  @Prop({ type: [String] })
  receipt?: string;

  @Prop({ default: false })
  isRecurring: boolean;

  @Prop({
    type: {
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
      nextDate: Date,
      endDate: { type: Date, required: false },
    },
    required: false,
  })
  recurringDetails?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    nextDate: Date;
    endDate?: Date;
  };
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

// Create indexes
ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ companyId: 1, date: -1 });
ExpenseSchema.index({ merchantId: 1 });
ExpenseSchema.index({ categoryId: 1 });
ExpenseSchema.index({ status: 1 });
ExpenseSchema.index({ tags: 1 });
ExpenseSchema.index({ location: '2dsphere' }); 