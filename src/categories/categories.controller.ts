import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthRolesGuard } from 'src/users/guards/auth-roles.guard';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { UserRole } from 'src/utils/enums';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { JWTPayloadType } from 'src/utils/types';
import { ObjectId } from 'mongodb';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Controller('api/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @Post()
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  public createNewCategory(
    @Body() createCategory: CreateCategoryDto,
    @CurrentUser() paylod: JWTPayloadType,
  ) {
    return this.categoriesService.CreateCategory(createCategory, paylod.id);
  }
  @Get()
  public getAllCategories() {
    return this.categoriesService.getAllCategories();
  }
  @Get(':id')
  public getSingleCategory(@Param('id') id: string) {
    return this.categoriesService.getCategoryBy(id);
  }
  @Put(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  public updateCategory(
    @Param('id') id: string,
    @Body() updateCategory: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, updateCategory);
  }
  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  public deleteCategory(@Param('id') id: string) {
    return this.categoriesService.deleteCategory(id);
  }
}
