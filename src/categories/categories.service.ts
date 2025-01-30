import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    private readonly usersService: UsersService,
  ) {}
  public async CreateCategory(
    createCategory: CreateCategoryDto,
    userId: ObjectId | string,
  ) {
    const user = await this.usersService.getCurrentUser(userId);
    const newCategory = await this.categoriesRepository.create({
      ...createCategory,
      title: createCategory.title,
      user,
    });
    return await this.categoriesRepository.save(newCategory);
  }
  public getAllCategories() {
    return this.categoriesRepository.find();
  }
  public async getCategoryBy(id: ObjectId | string) {
    let objectId: ObjectId;
    try {
      objectId = typeof id === 'string' ? new ObjectId(id) : id;
    } catch (error) {
      throw new BadRequestException('Invalid ID format');
    }

    const category = await this.categoriesRepository.findOne({
      where: { _id: objectId },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }
  public async updateCategory(
    id: ObjectId | string,
    updateCategory: UpdateCategoryDto,
  ) {
    const category = await this.getCategoryBy(id);
    category.title = updateCategory.title ?? category.title;
    return this.categoriesRepository.save(category);
  }
  public async deleteCategory(id: ObjectId | string) {
    const category = await this.getCategoryBy(id);
    await this.categoriesRepository.remove(category);
    return { message: 'Category deleted successfully' };
  }
}
