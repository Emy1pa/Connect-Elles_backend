import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FavoriteService } from './favorites.service';
import { AuthRolesGuard } from 'src/users/guards/auth-roles.guard';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { UserRole } from 'src/utils/enums';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('Favorites')
@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  @Post(':userId/:blogId')
  @ApiOperation({ summary: 'Ajouter un favori pour un utilisateur' })
  @ApiParam({ name: 'userId', type: String })
  @ApiParam({ name: 'blogId', type: String })
  @ApiResponse({ status: 201, description: 'Favori ajouté avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  async addFavorite(
    @Param('userId') userId: string,
    @Param('blogId') blogId: string,
  ) {
    try {
      return await this.favoriteService.addFavorite(userId, blogId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  @Delete(':favoriteId')
  @ApiOperation({ summary: 'Supprimer un favori' })
  @ApiParam({ name: 'favoriteId', type: String })
  @ApiResponse({ status: 200, description: 'Favori supprimé avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  async removeFavorite(@Param('favoriteId') favoriteId: string) {
    try {
      return await this.favoriteService.removeFavorite(favoriteId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  @Get(':userId')
  @ApiOperation({ summary: 'Récupérer les favoris d’un utilisateur' })
  @ApiParam({ name: 'userId', type: String })
  @ApiResponse({
    status: 200,
    description: 'Liste des favoris de l’utilisateur',
  })
  async getUserFavorites(@Param('userId') userId: string) {
    try {
      return await this.favoriteService.getUserFavorite(userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('statistics/:userId')
  @ApiOperation({ summary: 'Obtenir le nombre de favoris d’un utilisateur' })
  @ApiParam({ name: 'userId', type: String })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des favoris utilisateur',
  })
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR, UserRole.NORMAL_USER)
  async getFavorisStatistics(@Param('userId') userId: string) {
    return this.favoriteService.getFavoriteCount(userId);
  }
  @Get('statistics/mentor/:mentorId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: 'Obtenir le nombre de favoris pour un mentor' })
  @ApiParam({ name: 'mentorId', type: String })
  @ApiResponse({ status: 200, description: 'Statistiques des favoris mentor' })
  async getMentorFavorisStatistics(@Param('mentorId') mentorId: string) {
    return this.favoriteService.getMentorFavoriteCount(mentorId);
  }
  @Get('admin/statistics')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtenir les statistiques globales des favoris' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des favoris administrateur',
  })
  async getAdminStatistics() {
    return this.favoriteService.getAdminStatistics();
  }

  @Get('blog/favorites/:blogId')
  @ApiOperation({ summary: 'Obtenir le nombre de favoris pour un blog' })
  @ApiParam({ name: 'blogId', type: String })
  @ApiResponse({ status: 200, description: 'Nombre de favoris du blog' })
  // @UseGuards(AuthRolesGuard)
  // @Roles(UserRole.NORMAL_USER)
  async getBlogFavorites(@Param('blogId') blogId: string) {
    return this.favoriteService.getBlogFavoriteCount(blogId);
  }
}
