import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document, Types } from "mongoose";

import type { BaseDocument } from "./base.schema";
import type { ReceiptMetadata } from "../interfaces/metadata";

export type ReceiptDocument = Receipt & Document;

@Schema({ timestamps: true })
export class Receipt implements BaseDocument {
    public _id!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt?: Date;
    public isDeleted!: boolean;
    public userId!: Types.ObjectId | string;
    public companyId?: Types.ObjectId | string;
    public expenseId?: Types.ObjectId | string;
    public filename!: string;
    public mimeType!: string;
    public size!: number;
    public status!: string;
    public tags?: string[];

    @Prop({ type: Object })
    public metadata?: ReceiptMetadata;

    public processing?: {
        startTime: Date;
        endTime?: Date;
        duration?: number;
        status: string;
        error?: string;
    };

    constructor(partial: Partial<Receipt>) {
        Object.assign(this, partial);
    }
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);

// Add indexes
ReceiptSchema.index({ userId: 1 });
ReceiptSchema.index({ companyId: 1 });
ReceiptSchema.index({ expenseId: 1 });
ReceiptSchema.index({ status: 1 });
ReceiptSchema.index({ tags: 1 });
ReceiptSchema.index({ "metadata.date": 1 });
ReceiptSchema.index({ "metadata.total": 1 });
ReceiptSchema.index({ "metadata.merchant": 1 }); 