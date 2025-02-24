import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Favorite, FavoriteDocument } from './favorite.schema';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/users/user.schema';
import { Blog, BlogDocument } from 'src/blogs/blog.schema';
import { FavoriteDto } from './dtos/favorite.dto';

Injectable();
export class FavoriteService {
  constructor(
    @InjectModel(Favorite.name)
    private favoriteModel: Model<FavoriteDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}
  async addFavorite(userId: string, blogId: string) {
    try {
      const existingUser = await this.userModel.findById(userId);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }
      const blog = await this.blogModel.findById(blogId);
      if (!blog) {
        throw new NotFoundException('Blog not found');
      }
      const existingFavorite = await this.favoriteModel.findOne({
        user: new Types.ObjectId(userId),
        blog: new Types.ObjectId(blogId),
      });
      if (existingFavorite) {
        throw new BadRequestException(
          'This blog is already added to your favorites',
        );
      }
      let newFavorite = await this.favoriteModel.create({
        user: new Types.ObjectId(userId),
        blog: new Types.ObjectId(blogId),
      });
      return {
        ...newFavorite.toObject(),
        _id: newFavorite._id.toString(),
        user: newFavorite.user.toString(),
        blog: newFavorite.blog.toString(),
      };
    } catch (error) {
      throw new BadRequestException('Failed to add favorite');
    }
  }
}
