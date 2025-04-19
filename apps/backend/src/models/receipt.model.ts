import { type Document, Schema, type Types, model } from "mongoose";

export interface IReceipt extends Document {
  filename: string;
  thumbnailUrl: string;
  fullImageUrl: string;
  uploadDate: Date;
  merchant: string;
  amount: number;
  transactionId?: Types.ObjectId;
  userId: Types.ObjectId;
  r2Key: string;
  r2ThumbnailKey: string;
  matchStatus: "unmatched" | "pending" | "matched" | "manual" | "review";
  matchConfidence?: number;
  lastMatchAttempt?: Date;
  matchHistory?: Array<{
    transactionId: Types.ObjectId;
    confidence: number;
    attemptedAt: Date;
    factors: {
      amount: number;
      date: number;
      merchant: number;
      location?: number;
      category?: number;
      paymentMethod?: number;
    };
  }>;
  metadata?: {
    mimeType: string;
    size: number;
    dimensions?: {
      width: number;
      height: number;
    };
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    paymentMethod?: string;
    category?: string;
  };
  ocr?: {
    text: string;
    confidence: number;
    processedAt: Date;
  };
  userFeedback?: {
    isCorrect: boolean;
    feedbackDate: Date;
    notes?: string;
  };
  matchingPreferences?: {
    amountTolerance: number;
    dateRangeDays: number;
    weights: {
      amount: number;
      date: number;
      merchant: number;
      location?: number;
      category?: number;
      paymentMethod?: number;
    };
  };
}

const receiptSchema = new Schema<IReceipt>(
  {
    filename: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    fullImageUrl: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    merchant: { type: String, required: true },
    amount: { type: Number, required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    r2Key: { type: String, required: true },
    r2ThumbnailKey: { type: String, required: true },
    matchStatus: {
      type: String,
      enum: ["unmatched", "pending", "matched", "manual", "review"],
      default: "unmatched",
    },
    matchConfidence: { type: Number, min: 0, max: 1 },
    lastMatchAttempt: { type: Date },
    matchHistory: [
      {
        transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
        confidence: { type: Number, min: 0, max: 1 },
        attemptedAt: { type: Date, default: Date.now },
        factors: {
          amount: { type: Number, min: 0, max: 1 },
          date: { type: Number, min: 0, max: 1 },
          merchant: { type: Number, min: 0, max: 1 },
          location: { type: Number, min: 0, max: 1 },
          category: { type: Number, min: 0, max: 1 },
          paymentMethod: { type: Number, min: 0, max: 1 },
        },
      },
    ],
    metadata: {
      mimeType: String,
      size: Number,
      dimensions: {
        width: Number,
        height: Number,
      },
      location: {
        latitude: Number,
        longitude: Number,
        address: String,
      },
      paymentMethod: String,
      category: String,
    },
    ocr: {
      text: String,
      confidence: Number,
      processedAt: Date,
    },
    userFeedback: {
      isCorrect: Boolean,
      feedbackDate: { type: Date, default: Date.now },
      notes: String,
    },
    matchingPreferences: {
      amountTolerance: { type: Number, default: 0.1 },
      dateRangeDays: { type: Number, default: 7 },
      weights: {
        amount: { type: Number, default: 0.4 },
        date: { type: Number, default: 0.3 },
        merchant: { type: Number, default: 0.3 },
        location: { type: Number, default: 0 },
        category: { type: Number, default: 0 },
        paymentMethod: { type: Number, default: 0 },
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        ret._id = undefined;
        ret.__v = undefined;
        return ret;
      },
    },
  },
);

// Add text index for search functionality
receiptSchema.index({
  merchant: { name: "text" },
  filename: "text",
  "ocr.text": "text",
  "metadata.category": "text",
  "metadata.paymentMethod": "text",
});

// Add indexes for matching
receiptSchema.index({ userId: 1, matchStatus: 1 });
receiptSchema.index({ userId: 1, uploadDate: 1 });
receiptSchema.index({ userId: 1, amount: { value: 1, currency: "USD" } });
receiptSchema.index({ userId: 1, "metadata.location": "2dsphere" });
receiptSchema.index({ userId: 1, "metadata.category": 1 });
receiptSchema.index({ userId: 1, "metadata.paymentMethod": 1 });

// Add compound indexes for common queries
receiptSchema.index({ userId: 1, matchStatus: 1, uploadDate: -1 });
receiptSchema.index({ userId: 1, matchConfidence: -1, uploadDate: -1 });

export const Receipt = model<IReceipt>("Receipt", receiptSchema);
