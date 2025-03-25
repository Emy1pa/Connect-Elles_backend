import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
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
@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':userId/:blogId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER, UserRole.MENTOR)
  @ApiOperation({ summary: 'Créer un commentaire sur un blog' })
  @ApiParam({ name: 'userId', type: String })
  @ApiParam({ name: 'blogId', type: String })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, description: 'Commentaire créé avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Param('blogId') blogId: string,
    @Param('userId') userId: string,
  ) {
    return this.commentService.createComment(createCommentDto, userId, blogId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir tous les commentaires' })
  @ApiResponse({ status: 200, description: 'Liste de tous les commentaires' })
  async getAllComments() {
    return this.commentService.getAllComments();
  }

  @Get('user/:userId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  @ApiOperation({ summary: 'Obtenir les commentaires d’un utilisateur' })
  @ApiParam({ name: 'userId', type: String })
  @ApiResponse({ status: 200, description: 'Commentaires de l’utilisateur' })
  async getUserComments(@Param('userId') userId: string) {
    return this.commentService.getUserComments(userId);
  }

  @Get(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  @ApiOperation({ summary: 'Obtenir un commentaire par ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Détails du commentaire' })
  @ApiResponse({ status: 404, description: 'Commentaire non trouvé' })
  async getCommentById(@Param('id') id: string) {
    return this.commentService.getCommentBy(id);
  }

  @Patch(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  @ApiOperation({ summary: 'Mettre à jour un commentaire' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({
    status: 200,
    description: 'Commentaire mis à jour avec succès',
  })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.updateComment(id, updateCommentDto);
  }

  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  @ApiOperation({ summary: 'Supprimer un commentaire' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Commentaire supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Commentaire non trouvé' })
  async removeComment(@Param('id') commentId: string) {
    return this.commentService.removeComment(commentId);
  }

  @Get('blog/:blogId')
  @ApiOperation({ summary: 'Obtenir les commentaires d’un blog' })
  @ApiParam({ name: 'blogId', type: String })
  @ApiResponse({ status: 200, description: 'Commentaires du blog' })
  async getBlogComments(@Param('blogId') blogId: string) {
    return this.commentService.getBlogComments(blogId);
  }
  @Get('statistics/:userId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.NORMAL_USER)
  @ApiOperation({
    summary: 'Obtenir le nombre de commentaires d’un utilisateur',
  })
  @ApiParam({ name: 'userId', type: String })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des commentaires utilisateur',
  })
  async getCommentsStatistics(@Param('userId') userId: string) {
    return this.commentService.getCommentCount(userId);
  }

  @Get('statistics/mentor/:mentorId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: 'Obtenir le nombre de commentaires d’un mentor' })
  @ApiParam({ name: 'mentorId', type: String })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des commentaires mentor',
  })
  async getMentorCommentsStatistics(@Param('mentorId') mentorId: string) {
    return this.commentService.getMentorCommentCount(mentorId);
  }

  @Get('admin/statistics')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Obtenir les statistiques globales des commentaires',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des commentaires administrateur',
  })
  async getAdminStatistics() {
    return this.commentService.getAdminStatistics();
  }
}
