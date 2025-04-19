import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document } from "mongoose";

@Schema({ timestamps: true })
export class BaseDocument {
  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: String })
  _id: string;

  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: String })
  updatedBy?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: String })
  backupId?: string;

  @Prop({ type: Date })
  backupDate?: Date;

  @Prop({ type: String })
  backupSource?: string;

  @Prop({ type: String })
  backupVersion?: string;

  @Prop({ type: Object })
  backupMetadata?: {
    checksum?: string;
    size?: number;
    location?: string;
    [key: string]: any;
  };
}

export type BaseDocumentType = BaseDocument & Document;
export const BaseSchema = SchemaFactory.createForClass(BaseDocument);
