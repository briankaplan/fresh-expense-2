import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Company' })
  companyId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Merchant' })
  merchantId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  categoryId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, default: 'USD' })
  currency: string;

  @Prop()
  description: string;

  @Prop([String])
  tags: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Receipt' })
  receiptId: MongooseSchema.Types.ObjectId;

  @Prop()
  transactionId: string;

  @Prop({ required: true, default: 'pending' })
  status: string;

  @Prop({ required: true })
  paymentMethod: string;

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
  location: {
    type: string;
    coordinates: number[];
  };

  @Prop({ type: Object })
  metadata: Record<string, any>;
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