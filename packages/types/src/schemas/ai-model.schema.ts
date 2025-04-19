import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document } from "mongoose";
import type { BaseDocument } from "./base.schema";

export type AIModelDocument = AIModel & Document;

export enum ModelType {
  MERCHANT_MATCHING = "MERCHANT_MATCHING",
  CATEGORY_PREDICTION = "CATEGORY_PREDICTION",
  FRAUD_DETECTION = "FRAUD_DETECTION",
  SPENDING_PATTERN = "SPENDING_PATTERN",
  RECEIPT_PARSING = "RECEIPT_PARSING",
}

export enum ModelStatus {
  TRAINING = "TRAINING",
  ACTIVE = "ACTIVE",
  DEPRECATED = "DEPRECATED",
  ERROR = "ERROR",
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingTime: number;
  inferenceTime: number;
}

export interface TrainingData {
  input: any;
  output: any;
  confidence: number;
  timestamp: Date;
  source: string;
}

@Schema({
  timestamps: true,
  collection: "ai_models",
})
export class AIModel implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, enum: ModelType })
  type!: ModelType;

  @Prop({ required: true, enum: ModelStatus })
  status!: ModelStatus;

  @Prop({ required: true })
  version!: string;

  @Prop({ type: Object })
  metrics!: ModelMetrics;

  @Prop({ type: Object })
  configuration!: {
    algorithm: string;
    parameters: Record<string, any>;
    features: string[];
    target: string;
  };

  @Prop({ type: [Object] })
  trainingData!: TrainingData[];

  @Prop({ type: Object })
  performance!: {
    daily: {
      date: Date;
      accuracy: number;
      requests: number;
      errors: number;
    }[];
    weekly: {
      week: number;
      accuracy: number;
      requests: number;
      errors: number;
    }[];
  };

  @Prop({ type: String })
  modelPath!: string;

  @Prop({ type: Object })
  metadata!: {
    lastTraining: Date;
    nextTraining?: Date;
    trainingSize: number;
    validationSize: number;
    testSize: number;
    trainingDuration: number;
    hardwareUsed: string;
  };

  @Prop({ type: String })
  error?: string;

  @Prop({ type: Object })
  history!: {
    timestamp: Date;
    status: ModelStatus;
    version: string;
    metrics: ModelMetrics;
  }[];

  constructor(partial: Partial<AIModel>) {
    Object.assign(this, partial);
  }
}

export const AIModelSchema = SchemaFactory.createForClass(AIModel);

// Indexes
AIModelSchema.index({ type: 1, status: 1 });
AIModelSchema.index({ version: 1 });
AIModelSchema.index({ "metrics.accuracy": 1 });
AIModelSchema.index({ "metadata.lastTraining": 1 });
