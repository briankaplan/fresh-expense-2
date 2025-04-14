export interface BaseDocument {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseSchema {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isDeleted: boolean;
} 