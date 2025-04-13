import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { 
  TransactionType, 
  TransactionStatus, 
  TransactionProcessingStatus, 
  TransactionSource,
  TransactionCompany,
  TransactionPaymentMethod,
  TransactionPaymentProcessor,
  TransactionReimbursementStatus
} from '../transactions/enums/transaction.enums';

export type TransactionDocument = Transaction & Document;
export type TransactionModel = Model<TransactionDocument>;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({
    type: String,
    ref: 'User',
    required: true,
    index: true,
  })
  userId!: string;

  @Prop({
    required: true,
    index: true,
  })
  accountId!: string;

  @Prop({
    required: true,
  })
  amount!: number;

  @Prop({
    required: true,
    index: true,
  })
  date!: Date;

  @Prop({
    required: true,
  })
  description!: string;

  @Prop({
    index: true,
  })
  merchant?: string;

  @Prop({
    type: String,
    ref: 'Merchant',
    index: true,
  })
  merchantId?: string;

  @Prop({
    enum: TransactionType,
    required: true,
  })
  type!: TransactionType;

  @Prop({
    enum: TransactionStatus,
    default: TransactionStatus.POSTED,
  })
  status!: TransactionStatus;

  @Prop()
  runningBalance?: number;

  @Prop({
    default: false,
    index: true,
  })
  isExpense!: boolean;

  @Prop({
    index: true,
  })
  category?: string;

  @Prop()
  subcategory?: string;

  @Prop({
    enum: TransactionPaymentMethod,
  })
  paymentMethod?: TransactionPaymentMethod;

  @Prop({
    default: false,
  })
  isPaymentProcessor!: boolean;

  @Prop({
    name: String,
    type: {
      type: String,
      enum: TransactionPaymentProcessor,
    },
  })
  paymentProcessor?: {
    name: string;
    type: TransactionPaymentProcessor;
  };

  @Prop({
    name: String,
    category: {
      main: String,
      sub: String,
      type: String,
    },
    isPersonal: Boolean,
  })
  actualService?: {
    name: string;
    category: {
      main: string;
      sub: string;
      type: string;
    };
    isPersonal: boolean;
  };

  @Prop({
    default: false,
  })
  isSplit!: boolean;

  @Prop([
    {
      service: {
        name: String,
        category: {
          main: String,
          sub: String,
          type: String,
        },
        isPersonal: Boolean,
      },
      amount: {
        type: Number,
        required: true,
      },
      company: {
        type: String,
        enum: TransactionCompany,
        default: TransactionCompany.PERSONAL,
      },
    },
  ])
  splitTransactions: Array<{
    service: {
      name: string;
      category: {
        main: string;
        sub: string;
        type: string;
      };
      isPersonal: boolean;
    };
    amount: number;
    company: TransactionCompany;
  }> = [];

  @Prop({
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      type: [Number],
      index: '2dsphere',
    },
  })
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: [number, number];
  };

  @Prop({
    url: String,
    filename: String,
    uploadedAt: Date,
  })
  receipt?: {
    url?: string;
    filename?: string;
    uploadedAt?: Date;
  };

  @Prop([
    {
      type: String,
      index: true,
    },
  ])
  tags: string[] = [];

  @Prop()
  notes?: string;

  @Prop({
    default: false,
  })
  isReimbursable!: boolean;

  @Prop({
    enum: TransactionReimbursementStatus,
    default: TransactionReimbursementStatus.NOT_REIMBURSABLE,
  })
  reimbursementStatus!: TransactionReimbursementStatus;

  @Prop({
    type: String,
    enum: TransactionCompany,
    default: TransactionCompany.PERSONAL,
    index: true,
  })
  company!: TransactionCompany;

  @Prop({
    type: String,
    enum: TransactionSource,
    required: true,
  })
  source!: TransactionSource;

  @Prop()
  sourceId?: string;

  @Prop({
    id: String,
    accountId: String,
    status: String,
    raw: Object,
  })
  tellerData?: {
    id?: string;
    accountId?: string;
    status?: string;
    raw?: Record<string, unknown>;
  };

  @Prop()
  metadata?: Record<string, unknown>;

  @Prop({
    default: false,
  })
  processed!: boolean;

  @Prop()
  processedAt?: Date;

  @Prop()
  lastSyncedAt?: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Indexes
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, merchant: 1 });
TransactionSchema.index({ userId: 1, category: 1 });
TransactionSchema.index({ userId: 1, company: 1 });
TransactionSchema.index({ userId: 1, isExpense: 1 });
TransactionSchema.index({ userId: 1, isPaymentProcessor: 1 });
TransactionSchema.index({ userId: 1, 'paymentProcessor.type': 1 });
TransactionSchema.index({ userId: 1, 'actualService.name': 1 });
TransactionSchema.index({ userId: 1, isSplit: 1 });

// Pre-save middleware
TransactionSchema.pre('save', function (next: (err?: Error) => void) {
  // Auto-set isExpense for debit transactions
  if (this['type'] === 'debit') {
    this['isExpense'] = true;
  }

  // Validate split transactions
  if (this['isSplit'] && this['splitTransactions']) {
    const totalSplitAmount = this['splitTransactions'].reduce(
      (sum, split) => sum + split.amount,
      0
    );
    if (Math.abs(totalSplitAmount - this['amount']) > 0.01) {
      throw new Error('Split transaction amounts must sum to the total transaction amount');
    }
  }

  next();
});

// Methods
TransactionSchema.methods['markAsReimbursed'] = async function () {
  this['reimbursementStatus'] = 'reimbursed';
  return this['save']();
};

TransactionSchema.methods['markAsReimbursable'] = async function () {
  this['isReimbursable'] = true;
  this['reimbursementStatus'] = 'pending';
  return this['save']();
};

TransactionSchema.methods['addSplitTransaction'] = async function (splitTransaction: {
  service: {
    name: string;
    category: {
      main: string;
      sub: string;
      type: string;
    };
    isPersonal: boolean;
  };
  amount: number;
  company: string;
}) {
  if (!this['isSplit']) {
    this['isSplit'] = true;
    this['splitTransactions'] = [];
  }
  this['splitTransactions'].push(splitTransaction);
  return this['save']();
};

TransactionSchema.methods['removeSplitTransaction'] = async function (serviceName: string) {
  if (this['isSplit']) {
    this['splitTransactions'] = this['splitTransactions'].filter(
      (split: {
        service: {
          name: string;
        };
      }) => split.service.name !== serviceName
    );
    if (this['splitTransactions'].length === 0) {
      this['isSplit'] = false;
    }
  }
  return this['save']();
};
