import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export class Notification {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  data: Record<string, any>;

  @Prop({ default: false })
  read: boolean;

  @Prop({ default: false })
  archived: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
