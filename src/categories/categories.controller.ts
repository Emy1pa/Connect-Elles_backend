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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('Categories')
@Controller('api/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @Post()
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer une nouvelle catégorie' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Catégorie créée avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  public createNewCategory(
    @Body() createCategory: CreateCategoryDto,
    @CurrentUser() paylod: JWTPayloadType,
  ) {
    return this.categoriesService.CreateCategory(createCategory, paylod.id);
  }
  @Get()
  @ApiOperation({ summary: 'Obtenir toutes les catégories' })
  @ApiResponse({ status: 200, description: 'Liste de toutes les catégories' })
  public getAllCategories() {
    return this.categoriesService.getAllCategories();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une catégorie par ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Détails de la catégorie' })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  public getSingleCategory(@Param('id') id: string) {
    return this.categoriesService.getCategoryBy(id);
  }
  @Put(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour une catégorie' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Catégorie mise à jour avec succès',
  })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  public updateCategory(
    @Param('id') id: string,
    @Body() updateCategory: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, updateCategory);
  }
  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Supprimer une catégorie' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Catégorie supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  public deleteCategory(@Param('id') id: string) {
    return this.categoriesService.deleteCategory(id);
  }

  @Get('admin/statistics')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtenir les statistiques globales des catégories' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des catégories administrateur',
  })
  async getAdminStatistics() {
    return this.categoriesService.getAdminStatistics();
  }
}
