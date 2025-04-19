import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseDocument } from '@fresh-expense/types';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification implements BaseDocument {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isDeleted!: boolean;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  type!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ default: false })
  isRead!: boolean;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  constructor(partial: Partial<Notification>) {
    Object.assign(this, partial);
  }
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
