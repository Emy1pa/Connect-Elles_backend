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
import { BlogsService } from './blogs.service';
import { AuthRolesGuard } from 'src/users/guards/auth-roles.guard';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { UserRole } from 'src/utils/enums';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { JWTPayloadType } from 'src/utils/types';
import { UpdateBlogDto } from './dtos/update-blog.dto';

@Controller('api/blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  public createNewBlog(
    @Body() createBlog: CreateBlogDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
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
  public getAllPublishedBlogs() {
    return this.blogsService.getAllPublishedBlogs();
  }
  @Put(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  public updateBlog(
    @Param('id') id: string,
    @Body() updateBlog: UpdateBlogDto,
  ) {
    return this.blogsService.updateBlog(id, updateBlog);
  }
  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  public deleteBlog(@Param('id') id: string, payload: JWTPayloadType) {
    return this.blogsService.deleteBlog(id, payload);
  }
}
