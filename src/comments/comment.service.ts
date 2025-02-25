import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommentDocument } from './comment.schema';
import { User, UserDocument } from 'src/users/user.schema';
import { Blog, BlogDocument } from 'src/blogs/blog.schema';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { text } from 'stream/consumers';

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
      throw new BadRequestException(
        `Failed to create comment: ${error.message}`,
      );
    }
  }

  async getAllComments() {
    try {
      const comments = await this.commentModel.find().lean().exec();
      return comments.map((comment) => ({
        ...comment,
        _id: comment._id.toString(),
        text: comment.text,
        user: {
          _id: comment.user._id.toString(),
          blog: {
            _id: comment.blog._id.toString(),
          },
        },
      }));
    } catch (error) {
      throw new Error('Failed to retrieve comments');
    }
  }

  async getUserComments(userId: string) {
    try {
      const existingUser = await this.userModel.findById(userId);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }
      const comments = await this.commentModel
        .find({
          user: new Types.ObjectId(userId),
        })
        .populate('blog', '_id title')
        .lean()
        .exec();
      return comments.map((comment) => ({
        _id: comment._id.toString(),
        text: comment.text,
        blog: comment.blog
          ? {
              _id: (comment.blog as any)._id.toString(),
              title: (comment.blog as any).title,
            }
          : null,
      }));
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve comments: ${error.message}`,
      );
    }
  }
}
