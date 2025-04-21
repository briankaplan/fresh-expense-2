import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document, Types } from "mongoose";

import type { BaseDocument } from "./base.schema";
import type { TransactionMetadata } from "../interfaces/metadata";

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction implements BaseDocument {
    public _id!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt?: Date;
    public isDeleted!: boolean;
    public userId!: Types.ObjectId | string;
    public companyId?: Types.ObjectId | string;
    public accountId!: string;
    public date!: Date;
    public amount!: number;
    public description!: string;
    public category?: string;
    public merchant?: string;
    public status!: string;
    public type!: string;
    public tags?: string[];
    public expenseId?: Types.ObjectId | string;
    public receiptId?: string;
    public notes?: string;

    @Prop({ type: Object })
    public metadata?: TransactionMetadata;

    constructor(partial: Partial<Transaction>) {
        Object.assign(this, partial);
    }
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Add indexes
TransactionSchema.index({ userId: 1 });
TransactionSchema.index({ companyId: 1 });
TransactionSchema.index({ accountId: 1 });
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ amount: 1 });
TransactionSchema.index({ category: 1 });
TransactionSchema.index({ merchant: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ tags: 1 });
TransactionSchema.index({ expenseId: 1 });
TransactionSchema.index({ receiptId: 1 }); 