import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { Category, CategoryDocument } from './category.schema';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoriesModel: Model<CategoryDocument>,
  ) {}
  public async CreateCategory(
    createCategory: CreateCategoryDto,
    userId: string,
  ) {
    try {
      const newCategory = await this.categoriesModel.create({
        ...createCategory,
        user: new Types.ObjectId(userId),
      });
      return {
        ...newCategory.toObject(),
        _id: newCategory._id.toString(),
        user: newCategory.user.toString(),
      };
    } catch (error) {
      throw new Error('Failed to create category');
    }
  }
  public async getAllCategories() {
    const categories = await this.categoriesModel
      .find()
      .populate('user')
      .lean()
      .exec();
    return categories.map((category) => ({
      ...category,
      _id: category._id.toString(),
      user: category.user ? (category.user as any)._id.toString() : null,
    }));
  }
  public async getCategoryBy(id: string) {
    try {
      const category = await this.categoriesModel
        .findById(id.toString())
        .populate('user', '_id fullName email userRole')
        .lean()
        .exec();
      if (!category) throw new NotFoundException('Category not found');
      const user = category.user as any;

      return {
        ...category,
        _id: category._id.toString(),
        user: {
          ...user,
          _id: user._id ? user._id.toString() : undefined,
        },
      };
    } catch (error) {
      throw new Error('Failed to retrieve category');
    }
  }
  public async updateCategory(id: string, updateCategory: UpdateCategoryDto) {
    try {
      const category = await this.categoriesModel
        .findByIdAndUpdate(
          id,
          { $set: updateCategory },
          { new: true, projection: { title: 1 } },
        )
        .lean();

      if (!category) throw new NotFoundException('Category not found');

      return {
        _id: category._id.toString(),
        title: category.title,
      };
    } catch (error) {
      throw new Error('Failed to update category');
    }
  }

  public async deleteCategory(id: string) {
    try {
      const category = await this.categoriesModel.findById(id);
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      await this.categoriesModel.deleteOne({ _id: id });
      return { message: 'Category deleted successfully' };
    } catch (error) {
      throw new Error('Failed to delete category');
    }
  }
}
