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

@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  @Post(':userId/:blogId')
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
  async getUserFavorites(@Param('userId') userId: string) {
    try {
      return await this.favoriteService.getUserFavorite(userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
