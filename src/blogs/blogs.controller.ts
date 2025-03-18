import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { AuthRolesGuard } from 'src/users/guards/auth-roles.guard';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { UserRole } from 'src/utils/enums';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { JWTPayloadType } from 'src/utils/types';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
@ApiTags('Blogs')
@Controller('api/blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('blogImage'))
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'Créer un nouveau blog' })
  @ApiBody({ type: CreateBlogDto })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Blog créé avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  public createNewBlog(
    @Body() createBlog: CreateBlogDto,
    @CurrentUser() payload: JWTPayloadType,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('File received:', file);

    if (file) {
      createBlog.blogImage = file.filename;
      console.log('File saved as:', file.filename);
    }
    return this.blogsService.createBlog(
      createBlog,
      payload.id,
      createBlog.categoryId,
    );
  }
  @Get()
  @ApiOperation({ summary: 'Obtenir tous les blogs' })
  @ApiResponse({ status: 200, description: 'Liste de tous les blogs' })
  public getAllBlogs() {
    return this.blogsService.getAllBlogs();
  }

  @Get('/published')
  @ApiOperation({ summary: 'Obtenir tous les blogs publiés' })
  @ApiResponse({ status: 200, description: 'Liste des blogs publiés' })
  public async getAllPublishedBlogs() {
    try {
      return await this.blogsService.getAllPublishedBlogs();
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  }
  @Get('/:id')
  @ApiOperation({ summary: 'Obtenir un blog par ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Détails du blog' })
  @ApiResponse({ status: 404, description: 'Blog non trouvé' })
  public getSingleBlog(@Param('id') id: string) {
    return this.blogsService.getBlogBy(id);
  }
  @Put(':id')
  @UseInterceptors(FileInterceptor('blogImage'))
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'Mettre à jour un blog' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateBlogDto })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Blog mis à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  public updateBlog(
    @Param('id') id: string,
    @Body() updateBlog: UpdateBlogDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('File received:', file);

    if (file) {
      updateBlog.blogImage = file.filename;
      console.log('File saved as:', file.filename);
    }
    return this.blogsService.updateBlog(id, updateBlog);
  }
  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'Supprimer un blog' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Blog supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Blog non trouvé' })
  public deleteBlog(@Param('id') id: string, payload: JWTPayloadType) {
    return this.blogsService.deleteBlog(id, payload);
  }

  @Get('statistics/:mentorId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({
    summary: 'Obtenir des statistiques de favoris pour un mentor',
  })
  @ApiParam({ name: 'mentorId', type: String })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des blogs pour le mentor',
  })
  async getFavorisStatistics(@Param('mentorId') mentorId: string) {
    return this.blogsService.getBlogsCount(mentorId);
  }

  @Get('admin/statistics')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Obtenir des statistiques administratives des blogs',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des blogs administratifs',
  })
  async getAdminStatistics() {
    return this.blogsService.getAdminStatistics();
  }

  @Get('mentor/:mentorId')
  @ApiOperation({ summary: 'Obtenir les blogs d’un mentor par ID' })
  @ApiParam({ name: 'mentorId', type: String })
  @ApiResponse({ status: 200, description: 'Liste des blogs du mentor' })
  async getBlogsByMentor(@Param('mentorId') mentorId: string) {
    return this.blogsService.getBlogsByMentor(mentorId);
  }
}
