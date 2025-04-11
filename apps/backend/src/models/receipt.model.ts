import { Schema, model, Document, Types } from 'mongoose';

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
  metadata?: {
    mimeType: string;
    size: number;
    dimensions?: {
      width: number;
      height: number;
    };
  };
  ocr?: {
    text: string;
    confidence: number;
    processedAt: Date;
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
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    r2Key: { type: String, required: true },
    r2ThumbnailKey: { type: String, required: true },
    metadata: {
      mimeType: String,
      size: Number,
      dimensions: {
        width: Number,
        height: Number,
      },
    },
    ocr: {
      text: String,
      confidence: Number,
      processedAt: Date,
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

// Add text index for search functionality
receiptSchema.index({ 
  'merchant': 'text',
  'filename': 'text',
  'ocr.text': 'text'
});

export const Receipt = model<IReceipt>('Receipt', receiptSchema); 