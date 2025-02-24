import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommentDocument } from './comment.schema';
import { User, UserDocument } from 'src/users/user.schema';
import { Blog, BlogDocument } from 'src/blogs/blog.schema';
import { CreateCommentDto } from './dtos/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name)
    private commentModel: Model<CommentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}

  public async createComment(
    createComment: CreateCommentDto,
    userId: string,
    blogId: string,
  ) {
    try {
      const existingUser = await this.userModel.findById(userId);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }
      const blog = await this.blogModel.findById(blogId);
      if (!blog) {
        throw new NotFoundException('Blog not found');
      }
      let newComment = await this.commentModel.create({
        ...createComment,
        text: createComment.text,
        user: new Types.ObjectId(userId),
        blog: new Types.ObjectId(blogId),
      });
      return {
        ...newComment.toObject(),
        _id: newComment._id.toString(),
        user: newComment.user._id.toString(),
        blog: newComment.blog._id.toString(),
      };
    } catch (error) {
      throw new Error('Failed to create comment');
    }
  }
}
