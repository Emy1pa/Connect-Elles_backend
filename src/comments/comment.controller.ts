import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { AuthRolesGuard } from 'src/users/guards/auth-roles.guard';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { UserRole } from 'src/utils/enums';

@Controller('comments')
@UseGuards(AuthRolesGuard)
@Roles(UserRole.NORMAL_USER)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':blogId')
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Param('blogId') blogId: string,
    @Body('userId') userId: string,
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

  @Put(':id')
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
}
