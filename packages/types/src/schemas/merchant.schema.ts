import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document, Types } from "mongoose";

import type { BaseDocument } from "./base.schema";

export type MerchantDocument = Merchant & Document;

@Schema({ timestamps: true })
export class Merchant implements BaseDocument {
    public _id!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt?: Date;
    public isDeleted!: boolean;
    public userId!: Types.ObjectId | string;
    public companyId?: Types.ObjectId | string;
    public name!: string;
    public category?: string;
    public address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
    };
    public contact?: {
        phone?: string;
        email?: string;
        website?: string;
    };
    public tags?: string[];

    @Prop({ type: Object })
    public metadata?: Record<string, unknown>;

    constructor(partial: Partial<Merchant>) {
        Object.assign(this, partial);
    }
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);

// Add indexes
MerchantSchema.index({ userId: 1 });
MerchantSchema.index({ companyId: 1 });
MerchantSchema.index({ name: 1 });
MerchantSchema.index({ category: 1 });
MerchantSchema.index({ tags: 1 });
MerchantSchema.index({ "address.city": 1 });
MerchantSchema.index({ "address.state": 1 });
MerchantSchema.index({ "address.country": 1 }); 