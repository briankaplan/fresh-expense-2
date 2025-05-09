import { Filter, FindOptions } from 'mongodb';
import { MongoDBService } from '../mongodb.service';
import { BaseRepository } from './base.repository';
import { CategorySchema, CATEGORY_COLLECTION } from '../schemas/category.schema';
import { BaseSchema } from '../schemas/base.schema';

export class CategoryRepository extends BaseRepository<CategorySchema> {
  protected readonly collectionName = CATEGORY_COLLECTION;

  constructor(mongoDBService: MongoDBService) {
    super(mongoDBService);
  }

  async findByUserId(userId: string): Promise<CategorySchema[]> {
    return this.find({ userId });
  }

  async findByType(userId: string, type: CategorySchema['type']): Promise<CategorySchema[]> {
    return this.find({ userId, type });
  }

  async findDefaultCategories(): Promise<CategorySchema[]> {
    return this.find({ isDefault: true });
  }

  async findSubcategories(parentId: string): Promise<CategorySchema[]> {
    return this.find({ parentId });
  }

  async findByName(userId: string, name: string): Promise<CategorySchema | null> {
    return this.findOne({ userId, name });
  }

  async updateCategory(
    categoryId: string,
    updates: Partial<Omit<CategorySchema, keyof BaseSchema>>
  ): Promise<boolean> {
    return this.update(
      { _id: categoryId },
      {
        $set: updates,
      }
    );
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    // First check if there are any subcategories
    const subcategories = await this.findSubcategories(categoryId);
    if (subcategories.length > 0) {
      throw new Error('Cannot delete category with subcategories');
    }
    return this.delete({ _id: categoryId });
  }
}
