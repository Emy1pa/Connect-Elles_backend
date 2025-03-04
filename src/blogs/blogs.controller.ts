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

@Controller('api/blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('blogImage'))
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
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
  public getAllBlogs() {
    return this.blogsService.getAllBlogs();
  }

  @Get('/published')
  public async getAllPublishedBlogs() {
    try {
      return await this.blogsService.getAllPublishedBlogs();
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  }
  @Get('/:id')
  public getSingleBlog(@Param('id') id: string) {
    return this.blogsService.getBlogBy(id);
  }
  @Put(':id')
  @UseInterceptors(FileInterceptor('blogImage'))
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
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
  public deleteBlog(@Param('id') id: string, payload: JWTPayloadType) {
    return this.blogsService.deleteBlog(id, payload);
  }

  @Get('statistics/:mentorId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  async getFavorisStatistics(@Param('mentorId') mentorId: string) {
    return this.blogsService.getBlogsCount(mentorId);
  }

  @Get('admin/statistics')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminStatistics() {
    return this.blogsService.getAdminStatistics();
  }
}
