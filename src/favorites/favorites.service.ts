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
      const newFavorite = await this.favoriteModel.create({
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
      console.log('error', error);
      throw new BadRequestException('Failed to add favorite');
    }
  }
  async removeFavorite(favoriteId: string) {
    try {
      const favorite = await this.favoriteModel.findById(favoriteId);
      if (!favorite) {
        throw new NotFoundException('Favorite not found');
      }
      await this.favoriteModel.deleteOne({ _id: favoriteId });
      return { message: 'Favorite removed successfully' };
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException('Failed to remove favorite');
    }
  }

  async getUserFavorite(userId: string) {
    try {
      const existingUser = await this.userModel.findById(userId);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }
      const favorites = await this.favoriteModel
        .find({
          user: new Types.ObjectId(userId),
        })
        .populate('blog', '_id title blogImage summary')
        .lean()
        .exec();
      return favorites.map((fav) => ({
        _id: fav._id.toString(),
        blog: fav.blog
          ? {
              _id: (fav.blog as any)._id.toString(),
              title: (fav.blog as any).title,
              blogImage: (fav.blog as any).blogImage,
              summary: (fav.blog as any).summary,
            }
          : null,
      }));
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException('Failed to retrieve favorites');
    }
  }

  async getFavoriteCount(userId: string) {
    try {
      const existingUser = await this.userModel.findById(userId);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }
      const favoris = await this.favoriteModel
        .find({
          user: new Types.ObjectId(userId),
        })
        .lean()
        .exec();
      const count = favoris.length;

      return { count };
    } catch (error) {
      throw new BadRequestException(
        `Failed to count favoris: ${error.message}`,
      );
    }
  }

  async getMentorFavoriteCount(mentorId: string) {
    try {
      const userObjectId = new Types.ObjectId(mentorId);

      const mentorBlogs = await this.blogModel
        .find({ user: userObjectId })
        .lean()
        .exec();

      if (!mentorBlogs || mentorBlogs.length === 0) {
        throw new NotFoundException('No blogs found for this mentor');
      }

      const blogIds = mentorBlogs.map((blog) => blog._id);

      const totalCount = await this.favoriteModel.countDocuments({
        blog: { $in: blogIds },
      });

      console.log(totalCount);
      return { count: totalCount };
    } catch (error) {
      throw new BadRequestException(
        `Failed to count favorites: ${error.message}`,
      );
    }
  }

  async getAdminStatistics() {
    try {
      const count = await this.favoriteModel.countDocuments();
      return { count };
    } catch (error) {
      throw new BadRequestException(
        `Failed to count favorites: ${error.message}`,
      );
    }
  }

  async getBlogFavoriteCount(blogId: string) {
    try {
      const blog = await this.blogModel.findById(blogId);
      if (!blog) {
        throw new NotFoundException('Blog not found');
      }

      const blogObjectId = new Types.ObjectId(blogId);

      const count = await this.favoriteModel.countDocuments({
        blog: blogObjectId,
      });

      return {
        blogId: blogId,
        title: blog.title,
        favoriteCount: count,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to count favorites for blog: ${error.message}`,
      );
    }
  }
}
