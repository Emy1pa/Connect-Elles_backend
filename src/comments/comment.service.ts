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
import { UpdateCommentDto } from './dtos/update-comment.dto';

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
  async getCommentBy(id: string) {
    try {
      const comment = await this.commentModel
        .findById(id.toString())
        .populate('user', '_id fullName')
        .populate('blog', '_id title')
        .lean()
        .exec();
      if (!comment) throw new NotFoundException('Comment not found');
      return {
        ...comment,
        _id: comment._id.toString(),
        user: comment.user
          ? {
              ...(comment.user as any),
              _id: (comment.user as any)._id.toString(),
              fullName: (comment.user as any).fullName,
            }
          : null,
        blog: comment.blog
          ? {
              ...(comment.blog as any),
              _id: (comment.blog as any)._id.toString(),
              title: (comment.blog as any).title,
            }
          : null,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve comment: ${error.message}`,
      );
    }
  }
  async updateComment(id: string, updateComment: UpdateCommentDto) {
    try {
      const comment = await this.getCommentBy(id);
      if (!comment) throw new NotFoundException('Comment not found');
      const result = await this.commentModel
        .findByIdAndUpdate(
          id,
          {
            $set: {
              ...updateComment,
            },
          },
          {
            new: true,
          },
        )
        .populate('user', '_id fullName')
        .populate('blog', '_id title')
        .lean()
        .exec();
      if (!result) {
        throw new Error('Failed to update comment');
      }
      const commentResponse = {
        ...result,
        _id: result._id.toString(),
        user: result.user
          ? {
              _id: (result.user as any)._id.toString(),
              fullName: (result.user as any).fullName,
            }
          : null,
        blog: result.blog
          ? {
              _id: (result.blog as any)._id.toString(),
              title: (result.blog as any).title,
            }
          : null,
      };
      return commentResponse;
    } catch (error) {
      throw new BadRequestException(
        `Failed to update comment: ${error.message}`,
      );
    }
  }
}
