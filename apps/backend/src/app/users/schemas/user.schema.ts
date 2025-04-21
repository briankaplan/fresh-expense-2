import { User, UserRole, UserStatus } from "@fresh-expense/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class UserDocument extends Document implements User {
    @Prop({ required: true })
    id!: string;

    @Prop({ required: true, unique: true })
    email!: string;

    @Prop({ required: true })
    password!: string;

    @Prop({ required: true })
    firstName!: string;

    @Prop({ required: true })
    lastName!: string;

    @Prop({ default: false })
    isEmailVerified!: boolean;

    @Prop({ type: [String], default: [] })
    companies!: string[];

    @Prop({ default: UserRole.USER })
    role!: UserRole;

    @Prop({ default: UserStatus.ACTIVE })
    status!: UserStatus;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument); 