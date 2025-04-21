import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document, Types } from "mongoose";

import type { BaseDocument } from "./base.schema";
import type { UserMetadata } from "../interfaces/metadata";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User implements BaseDocument {
    public _id!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt?: Date;
    public isDeleted!: boolean;
    public email!: string;
    public password?: string;
    public firstName?: string;
    public lastName?: string;
    public companyId?: Types.ObjectId | string;
    public role!: string;
    public status!: string;
    public settings?: {
        theme?: string;
        language?: string;
        timezone?: string;
        dateFormat?: string;
        notifications?: {
            email?: boolean;
            push?: boolean;
        };
    };
    public lastLoginAt?: Date;
    public verifiedAt?: Date;
    public tags?: string[];

    @Prop({ type: Object })
    public metadata?: UserMetadata;

    constructor(partial: Partial<User>) {
        Object.assign(this, partial);
    }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ companyId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ tags: 1 });
UserSchema.index({ lastLoginAt: -1 });
UserSchema.index({ verifiedAt: 1 }); 