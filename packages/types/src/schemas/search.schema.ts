import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseDocument } from './base.schema';

export type SearchDocument = Search & Document;

export enum SearchType {
  MERCHANT = 'MERCHANT',
  TRANSACTION = 'TRANSACTION',
  RECEIPT = 'RECEIPT',
  CATEGORY = 'CATEGORY',
  TAG = 'TAG',
}

export enum MatchAlgorithm {
  FUZZY = 'FUZZY',
  SEMANTIC = 'SEMANTIC',
  RULE_BASED = 'RULE_BASED',
  HYBRID = 'HYBRID',
}

export interface SearchResult {
  id: string;
  type: SearchType;
  score: number;
  confidence: number;
  metadata: Record<string, any>;
}

export interface MatchRule {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex';
  value: string;
  weight: number;
}

@Schema({
  timestamps: true,
  collection: 'search_index',
})
export class Search implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, enum: SearchType })
  type!: SearchType;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: Object })
  metadata!: {
    originalId: string;
    source: string;
    lastUpdated: Date;
    version: number;
  };

  @Prop({ type: [Object] })
  embeddings!: {
    provider: string;
    model: string;
    vector: number[];
    timestamp: Date;
  }[];

  @Prop({ type: Object })
  searchConfig!: {
    algorithm: MatchAlgorithm;
    rules: MatchRule[];
    weights: Record<string, number>;
    thresholds: {
      minScore: number;
      minConfidence: number;
    };
  };

  @Prop({ type: [Object] })
  matches!: {
    targetId: string;
    targetType: SearchType;
    score: number;
    confidence: number;
    matchedFields: string[];
    timestamp: Date;
  }[];

  @Prop({ type: Object })
  statistics!: {
    searchCount: number;
    matchCount: number;
    averageScore: number;
    lastSearched: Date;
  };

  @Prop({ type: Boolean, default: false })
  isActive!: boolean;

  constructor(partial: Partial<Search>) {
    Object.assign(this, partial);
  }
}

export const SearchSchema = SchemaFactory.createForClass(Search);

// Indexes
SearchSchema.index({ userId: 1, type: 1 });
SearchSchema.index({ content: 'text' });
SearchSchema.index({ 'metadata.originalId': 1 });
SearchSchema.index({ 'embeddings.vector': '2dsphere' });
SearchSchema.index({ 'matches.targetId': 1 });
SearchSchema.index({ 'statistics.lastSearched': 1 });
