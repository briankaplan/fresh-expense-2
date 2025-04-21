import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document, Types } from "mongoose";

import type { BaseDocument } from "./base.schema";
import type { CompanyType } from "./company.schema";
import type { ExpenseMetadata } from "../interfaces/metadata";

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense implements BaseDocument {
    public _id!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt?: Date;
    public isDeleted!: boolean;
    public userId!: Types.ObjectId | string;
    public companyType!: CompanyType;
    public date!: Date;
    public amount!: number;
    public description!: string;
    public category!: string;
    public tags?: string[];
    public status!: string;
    public reportedAt?: Date;
    public receiptId?: string;
    public notes?: string;

    // Categorization metadata
    public categorization?: {
        confidence?: number;
        suggestedCompanyType?: CompanyType;
        suggestedCategory?: string;
        matchedKeywords?: string[];
        matchedMerchants?: string[];
        lastUpdatedAt?: Date;
    };

    @Prop({ type: Object })
    public metadata?: ExpenseMetadata;

    constructor(partial: Partial<Expense>) {
        Object.assign(this, partial);
    }
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

// Add indexes
ExpenseSchema.index({ userId: 1 });
ExpenseSchema.index({ companyType: 1 });
ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ amount: 1 });
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ tags: 1 });
ExpenseSchema.index({ status: 1 });
ExpenseSchema.index({ reportedAt: 1 });
ExpenseSchema.index({ receiptId: 1 });
ExpenseSchema.index({ "categorization.confidence": 1 });
ExpenseSchema.index({ "categorization.suggestedCompanyType": 1 }); 