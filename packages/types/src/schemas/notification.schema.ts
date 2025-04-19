import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseDocument } from './base.schema';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  TRANSACTION = 'TRANSACTION',
  BUDGET = 'BUDGET',
  SYSTEM = 'SYSTEM',
  ALERT = 'ALERT'
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED'
}

@Schema({ timestamps: true })
export class Notification implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, type: String, enum: NotificationType })
  type!: NotificationType;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ type: String, enum: NotificationStatus, default: NotificationStatus.UNREAD })
  status!: NotificationStatus;

  @Prop({ type: Object, required: false })
  data?: {
    transactionId?: string;
    budgetId?: string;
    amount?: number;
    category?: string;
    merchant?: string;
    [key: string]: any;
  };

  @Prop({ type: Boolean, default: false })
  isRead!: boolean;

  @Prop({ type: Date })
  readAt?: Date;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;

  constructor(partial: Partial<Notification>) {
    Object.assign(this, partial);
  }
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes
NotificationSchema.index({ userId: 1, status: 1 });
NotificationSchema.index({ userId: 1, type: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 }); 