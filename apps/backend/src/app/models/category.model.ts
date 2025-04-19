import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Document, Model } from "mongoose";

export type CategoryDocument = Category & Document;
export type CategoryModel = Model<CategoryDocument>;

export class Category {
  @Prop({
    required: true,
    trim: true,
    unique: true,
    index: true,
  })
  name!: string;

  @Prop({
    trim: true,
  })
  description?: string;

  @Prop([
    {
      type: String,
      trim: true,
      lowercase: true,
    },
  ])
  keywords: string[] = [];

  @Prop({
    type: String,
    ref: "Category",
    index: true,
  })
  parent?: string;

  @Prop({
    default: false,
    index: true,
  })
  isDefault!: boolean;

  @Prop({
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: String,
      default: "1.0",
    },
  })
  metadata: {
    lastUpdated: Date;
    version: string;
  } = {
    lastUpdated: new Date(),
    version: "1.0",
  };
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Indexes
CategorySchema.index({ name: 1, parent: 1 });
CategorySchema.index({ keywords: 1 });

// Pre-save middleware
CategorySchema.pre("save", function (next: (err?: Error) => void) {
  this.metadata.lastUpdated = new Date();
  next();
});

// Static methods
CategorySchema.statics.findByName = async function (name: string) {
  return this.findOne({ name: { $regex: new RegExp(name, "i") } });
};

CategorySchema.statics.findByKeyword = function (keyword: string) {
  return this.find({ keywords: new RegExp(keyword, "i") });
};

CategorySchema.statics.findDefault = function () {
  return this.find({ isDefault: true });
};

// Instance methods
CategorySchema.methods.addKeyword = async function (keyword: string) {
  if (!this.keywords.includes(keyword.toLowerCase())) {
    this.keywords.push(keyword.toLowerCase());
  }
  return this.save();
};

CategorySchema.methods.removeKeyword = async function (keyword: string) {
  this.keywords = this.keywords.filter((k: string) => k !== keyword.toLowerCase());
  return this.save();
};

CategorySchema.methods.setAsDefault = async function () {
  // Remove default from other categories
  await (this.constructor as CategoryModel).updateMany({ isDefault: true }, { isDefault: false });
  this.isDefault = true;
  return this.save();
};
