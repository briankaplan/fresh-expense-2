import { Schema, model, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  date: Date;
  amount: number;
  merchant: string;
  category?: string;
  paymentMethod?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  metadata?: Record<string, any>;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    merchant: {
      type: String,
      required: true,
    },
    category: String,
    paymentMethod: String,
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Add indexes for common queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, amount: { value: 1, currency: "USD" } });
transactionSchema.index({ userId: 1, merchant: 1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, paymentMethod: 1 });
transactionSchema.index({ userId: 1, location: '2dsphere' });

export const Transaction = model<ITransaction>('Transaction', transactionSchema);
