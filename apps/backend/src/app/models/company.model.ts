import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Model } from "mongoose";

export class Company {
  @Prop({
    type: String,
    ref: "User",
    required: true,
    index: true,
  })
  userId!: string;

  @Prop({
    required: true,
    trim: true,
    index: true,
  })
  name!: string;

  @Prop({
    trim: true,
  })
  description?: string;

  @Prop({
    trim: true,
    index: true,
  })
  industry?: string;

  @Prop({
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    coordinates: {
      type: [Number],
      index: "2dsphere",
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
    currency: {
      type: String,
      default: "USD",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    dateFormat: {
      type: String,
      default: "MM/DD/YYYY",
    },
    fiscalYearStart: {
      type: Date,
      default: () => new Date(new Date().getFullYear(), 0, 1),
    },
    fiscalYearEnd: {
      type: Date,
      default: () => new Date(new Date().getFullYear(), 11, 31),
    },
  })
  settings: {
    currency: string;
    timezone: string;
    dateFormat: string;
    fiscalYearStart: Date;
    fiscalYearEnd: Date;
  } = {
    currency: "USD",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    fiscalYearStart: new Date(new Date().getFullYear(), 0, 1),
    fiscalYearEnd: new Date(new Date().getFullYear(), 11, 31),
  };

  @Prop({
    enum: ["active", "inactive", "archived"],
    default: "active",
    index: true,
  })
  status!: string;

  @Prop({
    teller: {
      enabled: Boolean,
      lastSync: Date,
      syncStatus: String,
    },
    email: {
      enabled: Boolean,
      lastSync: Date,
      syncStatus: String,
    },
    storage: {
      enabled: Boolean,
      lastSync: Date,
      syncStatus: String,
    },
  })
  integrations: {
    teller?: {
      enabled?: boolean;
      lastSync?: Date;
      syncStatus?: string;
    };
    email?: {
      enabled?: boolean;
      lastSync?: Date;
      syncStatus?: string;
    };
    storage?: {
      enabled?: boolean;
      lastSync?: Date;
      syncStatus?: string;
    };
  } = {};

  @Prop({
    createdBy: {
      type: String,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: String,
      ref: "User",
    },
    lastSyncedAt: Date,
    version: {
      type: String,
      default: "1.0",
    },
  })
  metadata: {
    createdBy: string;
    updatedBy?: string;
    lastSyncedAt?: Date;
    version: string;
  } = {
    createdBy: "",
    version: "1.0",
  };
}

export const CompanySchema = SchemaFactory.createForClass(Company);

// Indexes
CompanySchema.index({ userId: 1, name: 1 }, { unique: true });
CompanySchema.index({ userId: 1, industry: 1 });

// Pre-save middleware
CompanySchema.pre("save", function (next: (err?: Error) => void) {
  this["metadata"].updatedBy = this["metadata"].createdBy;
  next();
});

// Static methods
CompanySchema.statics["findByUser"] = function (userId: string) {
  return this.find({ userId });
};

CompanySchema.statics["findByIndustry"] = function (userId: string, industry: string) {
  return this.find({ userId, industry });
};

CompanySchema.statics["findNearLocation"] = function (
  userId: string,
  coordinates: [number, number],
  maxDistance: number,
) {
  return this.find({
    userId,
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates,
        },
        $maxDistance: maxDistance,
      },
    },
  });
};

// Instance methods
CompanySchema.methods["updateStatus"] = async function (status: string) {
  this["status"] = status;
  return this["save"]();
};

CompanySchema.methods["updateSettings"] = async function (settings: {
  currency?: string;
  timezone?: string;
  dateFormat?: string;
  fiscalYearStart?: Date;
  fiscalYearEnd?: Date;
}) {
  this["settings"] = {
    ...this["settings"],
    ...settings,
  };
  return this["save"]();
};

CompanySchema.methods["updateIntegrations"] = async function (
  integrationType: "teller" | "email" | "storage",
  data: {
    enabled?: boolean;
    lastSync?: Date;
    syncStatus?: string;
  },
) {
  this["integrations"][integrationType] = {
    ...this["integrations"][integrationType],
    ...data,
  };
  return this["save"]();
};

CompanySchema.methods["updateLocation"] = async function (location: {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates?: [number, number];
}) {
  this["location"] = {
    ...this["location"],
    ...location,
  };
  return this["save"]();
};

CompanySchema.methods["updateContact"] = async function (contact: {
  phone?: string;
  email?: string;
  website?: string;
}) {
  this["contact"] = {
    ...this["contact"],
    ...contact,
  };
  return this["save"]();
};
