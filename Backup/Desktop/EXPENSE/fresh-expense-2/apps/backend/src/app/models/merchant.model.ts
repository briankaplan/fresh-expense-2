import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';

export type MerchantDocument = Merchant & Document;
export type MerchantModel = Model<MerchantDocument>;

@Schema({ timestamps: true })
export class Merchant {
  @Prop({
    type: String,
    ref: 'User',
    required: true,
    index: true,
  })
  userId!: string;

  @Prop({
    type: String,
    ref: 'Company',
    required: true,
    index: true,
  })
  companyId!: string;

  @Prop({
    required: true,
    trim: true,
    index: true,
  })
  name!: string;

  @Prop([
    {
      type: String,
      trim: true,
    },
  ])
  aliases: string[] = [];

  @Prop([
    {
      type: String,
      trim: true,
    },
  ])
  patterns: string[] = [];

  @Prop({
    type: String,
    ref: 'Category',
    index: true,
  })
  category?: string;

  @Prop({
    enum: ['regular', 'payment_processor'],
    default: 'regular',
  })
  type!: string;

  @Prop({
    name: String,
    type: {
      type: String,
      enum: ['apple', 'google', 'other'],
    },
  })
  paymentProcessor?: {
    name: string;
    type: string;
  };

  @Prop([
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      category: {
        main: {
          type: String,
          required: true,
        },
        sub: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
      },
      isPersonal: {
        type: Boolean,
        default: false,
      },
      patterns: [
        {
          type: String,
          trim: true,
        },
      ],
      aliases: [
        {
          type: String,
          trim: true,
        },
      ],
    },
  ])
  services: Array<{
    name: string;
    category: {
      main: string;
      sub: string;
      type: string;
    };
    isPersonal: boolean;
    patterns: string[];
    aliases: string[];
  }> = [];

  @Prop({
    default: false,
  })
  isSplitReceipt!: boolean;

  @Prop({
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
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
    postalCode?: string;
    coordinates?: [number, number];
  };

  @Prop({
    phone: String,
    email: String,
    website: String,
  })
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };

  @Prop({
    transactionCount: {
      type: Number,
      default: 0,
    },
    lastTransactionDate: Date,
    totalSpent: Number,
    averageTransactionAmount: Number,
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: String,
      default: '1.0',
    },
  })
  metadata: {
    transactionCount: number;
    lastTransactionDate?: Date;
    totalSpent?: number;
    averageTransactionAmount?: number;
    lastUpdated: Date;
    version: string;
  } = {
    transactionCount: 0,
    lastUpdated: new Date(),
    version: '1.0',
  };
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);

// Indexes
MerchantSchema.index({ userId: 1, name: 1 }, { unique: true });
MerchantSchema.index({ userId: 1, companyId: 1 });
MerchantSchema.index({ 'location.coordinates': '2dsphere' });
MerchantSchema.index({ type: 1 });
MerchantSchema.index({ 'paymentProcessor.type': 1 });
MerchantSchema.index({ 'services.name': 1 });

// Pre-save middleware
MerchantSchema.pre('save', function (next: (err?: Error) => void) {
  this['metadata'].lastUpdated = new Date();
  next();
});

// Static methods
MerchantSchema.statics['findByUser'] = function (userId: string) {
  return this.find({ userId });
};

MerchantSchema.statics['findByCompany'] = function (userId: string, companyId: string) {
  return this.find({ userId, companyId });
};

MerchantSchema.statics['findByCategory'] = function (userId: string, categoryId: string) {
  return this.find({ userId, category: categoryId });
};

MerchantSchema.statics['findByName'] = function (userId: string, name: string) {
  return this.find({
    userId,
    $or: [
      { name: new RegExp(name, 'i') },
      { aliases: new RegExp(name, 'i') },
      { patterns: new RegExp(name, 'i') },
      { 'services.name': new RegExp(name, 'i') },
      { 'services.aliases': new RegExp(name, 'i') },
    ],
  });
};

MerchantSchema.statics['findPaymentProcessors'] = function (userId: string) {
  return this.find({ userId, type: 'payment_processor' });
};

MerchantSchema.statics['findByService'] = function (userId: string, serviceName: string) {
  return this.find({
    userId,
    'services.name': new RegExp(serviceName, 'i'),
  });
};

// Instance methods
MerchantSchema.methods['addAlias'] = async function (alias: string) {
  if (!this['aliases'].includes(alias)) {
    this['aliases'].push(alias);
  }
  return this['save']();
};

MerchantSchema.methods['removeAlias'] = async function (alias: string) {
  this['aliases'] = this['aliases'].filter((a: string) => a !== alias);
  return this['save']();
};

MerchantSchema.methods['addService'] = async function (service: {
  name: string;
  category: {
    main: string;
    sub: string;
    type: string;
  };
  isPersonal: boolean;
  patterns?: string[];
  aliases?: string[];
}) {
  if (!this['services'].some((s: { name: string }) => s.name === service.name)) {
    this['services'].push({
      ...service,
      patterns: service.patterns || [],
      aliases: service.aliases || [],
    });
  }
  return this['save']();
};

MerchantSchema.methods['removeService'] = async function (serviceName: string) {
  this['services'] = this['services'].filter((s: { name: string }) => s.name !== serviceName);
  return this['save']();
};

MerchantSchema.methods['updateCategory'] = async function (categoryId: string) {
  this['category'] = categoryId;
  return this['save']();
};

MerchantSchema.methods['updateLocation'] = async function (location: {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates?: [number, number];
}) {
  this['location'] = {
    ...this['location'],
    ...location,
  };
  return this['save']();
};

MerchantSchema.methods['updateContact'] = async function (contact: {
  phone?: string;
  email?: string;
  website?: string;
}) {
  this['contact'] = {
    ...this['contact'],
    ...contact,
  };
  return this['save']();
};
