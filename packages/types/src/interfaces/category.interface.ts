export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
