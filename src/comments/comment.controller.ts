import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Put,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { AuthRolesGuard } from 'src/users/guards/auth-roles.guard';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { UserRole } from 'src/utils/enums';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':userId/:blogId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER, UserRole.MENTOR)
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Param('blogId') blogId: string,
    @Param('userId') userId: string,
  ) {
    return this.commentService.createComment(createCommentDto, userId, blogId);
  }

  @Get()
  async getAllComments() {
    return this.commentService.getAllComments();
  }

  @Get('user/:userId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  async getUserComments(@Param('userId') userId: string) {
    return this.commentService.getUserComments(userId);
  }

  @Get(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  async getCommentById(@Param('id') id: string) {
    return this.commentService.getCommentBy(id);
  }

  @Patch(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.updateComment(id, updateCommentDto);
  }

  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.NORMAL_USER)
  async removeComment(@Param('id') commentId: string) {
    return this.commentService.removeComment(commentId);
  }

  @Get('blog/:blogId')
  async getBlogComments(@Param('blogId') blogId: string) {
    return this.commentService.getBlogComments(blogId);
  }
  @Get('statistics/:userId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.NORMAL_USER)
  async getCommentsStatistics(@Param('userId') userId: string) {
    return this.commentService.getCommentCount(userId);
  }

  @Get('statistics/mentor/:mentorId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  async getMentorCommentsStatistics(@Param('mentorId') mentorId: string) {
    return this.commentService.getMentorCommentCount(mentorId);
  }

  @Get('admin/statistics')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminStatistics() {
    return this.commentService.getAdminStatistics();
  }
}
