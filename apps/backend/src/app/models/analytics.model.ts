import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Model } from "mongoose";

export class Analytics {
  @Prop({
    type: String,
    ref: "User",
    required: true,
    index: true,
  })
  userId!: string;

  @Prop({
    type: String,
    ref: "Company",
    required: true,
    index: true,
  })
  companyId!: string;

  @Prop({
    type: Date,
    required: true,
    index: true,
  })
  startDate!: Date;

  @Prop({
    type: Date,
    required: true,
    index: true,
  })
  endDate!: Date;

  @Prop({
    type: String,
    enum: ["daily", "weekly", "monthly", "yearly"],
    required: true,
  })
  period!: string;

  @Prop({
    type: {
      totalSpent: Number,
      averageTransaction: Number,
      largestTransaction: Number,
      smallestTransaction: Number,
      transactionCount: Number,
    },
    required: true,
  })
  summary!: {
    totalSpent: number;
    averageTransaction: number;
    largestTransaction: number;
    smallestTransaction: number;
    transactionCount: number;
  };

  @Prop({
    type: [
      {
        category: String,
        amount: Number,
        percentage: Number,
        count: Number,
      },
    ],
    required: true,
  })
  spendingByCategory!: Array<{
    category: string;
    amount: number;
    percentage: number;
    count: number;
  }>;

  @Prop({
    type: [
      {
        merchant: String,
        amount: Number,
        count: Number,
      },
    ],
    required: true,
  })
  topMerchants!: Array<{
    merchant: string;
    amount: number;
    count: number;
  }>;

  @Prop({
    type: {
      daily: [
        {
          date: Date,
          amount: Number,
          count: Number,
        },
      ],
      weekly: [
        {
          week: Number,
          amount: Number,
          count: Number,
        },
      ],
      monthly: [
        {
          month: Number,
          amount: Number,
          count: Number,
        },
      ],
    },
    required: true,
  })
  spendingTrends!: {
    daily: Array<{
      date: Date;
      amount: number;
      count: number;
    }>;
    weekly: Array<{
      week: number;
      amount: number;
      count: number;
    }>;
    monthly: Array<{
      month: number;
      amount: number;
      count: number;
    }>;
  };

  @Prop({
    type: {
      overBudget: Boolean,
      budgetLimit: Number,
      currentSpending: Number,
      remainingBudget: Number,
      percentageUsed: Number,
    },
    required: true,
  })
  budgetStatus!: {
    overBudget: boolean;
    budgetLimit: number;
    currentSpending: number;
    remainingBudget: number;
    percentageUsed: number;
  };

  @Prop({
    type: [
      {
        type: String,
        message: String,
        severity: String,
        date: Date,
      },
    ],
    required: true,
  })
  insights!: Array<{
    type: string;
    message: string;
    severity: string;
    date: Date;
  }>;

  @Prop({
    type: {
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
    },
    required: true,
  })
  metadata!: {
    createdBy: string;
    updatedBy?: string;
    lastSyncedAt?: Date;
    version: string;
  };
}

export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);

// Indexes
AnalyticsSchema.index({ userId: 1, companyId: 1, startDate: 1, endDate: 1 }, { unique: true });

// Pre-save middleware
AnalyticsSchema.pre("save", function (next: (err?: Error) => void) {
  this["metadata"].updatedBy = this["metadata"].createdBy;
  next();
});

// Static methods
AnalyticsSchema.statics["findByUser"] = function (userId: string) {
  return this.find({ userId });
};

AnalyticsSchema.statics["findByCompany"] = function (companyId: string) {
  return this.find({ companyId });
};

AnalyticsSchema.statics["findByPeriod"] = function (
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  return this.find({
    userId,
    startDate: { $gte: startDate },
    endDate: { $lte: endDate },
  });
};

// Instance methods
AnalyticsSchema.methods["updateInsights"] = async function (
  insights: Array<{
    type: string;
    message: string;
    severity: string;
    date: Date;
  }>,
) {
  this["insights"] = insights;
  return this["save"]();
};

AnalyticsSchema.methods["updateBudgetStatus"] = async function (budgetStatus: {
  overBudget: boolean;
  budgetLimit: number;
  currentSpending: number;
  remainingBudget: number;
  percentageUsed: number;
}) {
  this["budgetStatus"] = budgetStatus;
  return this["save"]();
};
