import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MerchantDocument = Merchant & Document;

@Schema({ timestamps: true })
export class Merchant {
  @Prop({ required: true })
  name: string;

  @Prop()
  displayName: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  categoryId: MongooseSchema.Types.ObjectId;

  @Prop()
  logo: string;

  @Prop()
  website: string;

  @Prop([{
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  }])
  locations: Array<{
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates: number[];
  }>;

  @Prop()
  tellerMerchantId: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);

// Create indexes
MerchantSchema.index({ name: 1 });
MerchantSchema.index({ categoryId: 1 });
MerchantSchema.index({ tellerMerchantId: 1 }); 