import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document } from "mongoose";

import type { BaseDocument } from "./base.schema";
import type { CompanyMetadata } from "../interfaces/metadata";

export type CompanyDocument = Company & Document;

export type CompanyType = 'DOWN_HOME' | 'MUSIC_CITY_RODEO' | 'PERSONAL';

@Schema({ timestamps: true })
export class Company implements BaseDocument {
    public _id!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt?: Date;
    public isDeleted!: boolean;

    // Core company fields
    public name!: string;
    public type!: CompanyType;
    public description?: string;
    public status!: string;
    public tags?: string[];

    // AI Categorization fields
    public aiRules?: {
        keywords?: string[];
        categories?: string[];
        merchants?: string[];
        confidenceThreshold?: number;
        lastTrainedAt?: Date;
        accuracy?: number;
    };

    @Prop({ type: Object })
    public metadata?: CompanyMetadata;

    constructor(partial: Partial<Company>) {
        Object.assign(this, partial);
    }
}

export const CompanySchema = SchemaFactory.createForClass(Company);

// Add indexes
CompanySchema.index({ name: 1 }, { unique: true });
CompanySchema.index({ type: 1 });
CompanySchema.index({ status: 1 });
CompanySchema.index({ tags: 1 });
CompanySchema.index({ "aiRules.keywords": 1 });
CompanySchema.index({ "aiRules.categories": 1 });
CompanySchema.index({ "aiRules.merchants": 1 }); 