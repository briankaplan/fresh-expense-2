import { Schema, model, Document } from 'mongoose';

export interface IMetrics extends Document {
  type: 'match_success' | 'match_attempt' | 'error';
  confidence?: number;
  processingTime?: number;
  context?: string;
  error?: {
    message: string;
    stack?: string;
  };
  timestamp: Date;
}

const metricsSchema = new Schema<IMetrics>(
  {
    type: {
      type: String,
      enum: ['match_success', 'match_attempt', 'error'],
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    processingTime: {
      type: Number,
      min: 0,
    },
    context: String,
    error: {
      message: String,
      stack: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
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
metricsSchema.index({ type: 1, timestamp: -1 });
metricsSchema.index({ context: 1, timestamp: -1 });

export const Metrics = model<IMetrics>('Metrics', metricsSchema);
