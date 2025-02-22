import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog, BlogDocument } from './blog.schema';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { ObjectId } from 'mongodb';
import { BlogStatus } from 'src/utils/enums';
import { CategoriesService } from 'src/categories/categories.service';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { join } from 'path';
import { unlinkSync } from 'fs';
import { JWTPayloadType } from 'src/utils/types';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogsModel: Model<BlogDocument>,
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
  ) {}
  public async createBlog(
    createBlog: CreateBlogDto,
    userId: string,
    categoryId: string,
  ) {
    try {
      const { blogImage } = createBlog;
      let newBlog = await this.blogsModel.create({
        ...createBlog,
        title: createBlog.title,
        content: createBlog.content,
        status: createBlog.status ?? BlogStatus.ARCHIVED,
        blogImage: blogImage ? `/images/blogs/${blogImage}` : null,
        user: new Types.ObjectId(userId),
        category: new Types.ObjectId(categoryId),
      });
      return {
        ...newBlog.toObject(),
        _id: newBlog._id.toString(),
        user: newBlog.user.toString(),
        category: newBlog.category.toString(),
      };
    } catch (error) {
      throw new Error('Failed to create blog');
    }
  }
  public async getAllBlogs() {
    try {
      const blogs = await this.blogsModel.find().lean().exec();
      return blogs.map((blog) => ({
        ...blog,
        _id: blog._id.toString(),
        user: {
          _id: blog.user._id.toString(),
        },
        category: {
          _id: blog.category._id.toString(),
        },
      }));
    } catch (error) {
      throw new Error('Failed to retrieve blogs');
    }
  }
  public async getAllPublishedBlogs() {
    try {
      const blogs = await this.blogsModel
        .find({ status: BlogStatus.PUBLISHED })
        .lean()
        .exec();
      return blogs.map((blog) => ({
        ...blog,
        _id: blog._id.toString(),
        user: {
          _id: blog.user._id.toString(),
        },
        category: {
          _id: blog.category._id.toString(),
        },
      }));
    } catch (error) {
      console.error('Error fetching published blogs:', error);
      throw error;
    }
  }
  public async getBlogBy(id: string) {
    try {
      const blog = await this.blogsModel
        .findById(id.toString())
        .populate('user', '_id fullName')
        .populate('category', '_id title')
        .lean()
        .exec();
      if (!blog) throw new NotFoundException('Blog not found');
      return {
        ...blog,
        _id: blog._id.toString(),
        user: blog.user
          ? {
              ...(blog.user as any),
              _id: (blog.user as any)._id.toString(),
              fullName: (blog.user as any).fullName.toString(),
            }
          : null,
        category: blog.category
          ? {
              ...(blog.category as any),
              _id: (blog.category as any)._id.toString(),
              title: (blog.category as any).title.toString(),
            }
          : null,
      };
    } catch (error) {
      throw new Error('Failed to retrieve blog');
    }
  }
  public async updateBlog(id: string, updateBlog: UpdateBlogDto) {
    try {
      const { blogImage } = updateBlog;
      const blog = await this.getBlogBy(id);
      if (!blog) throw new NotFoundException('Blog not found');

      if (blogImage) {
        if (blog.blogImage) {
          await this.removeBlogImage(id);
        }
      }
      const result = await this.blogsModel.updateOne(
        { _id: id },
        {
          $set: {
            ...updateBlog,
            blogImage: blogImage
              ? `/images/blogs/${blogImage}`
              : blog.blogImage,
          },
        },
      );
      if (result.modifiedCount === 0) {
        throw new Error('Failed to update blog');
      }
      return { message: 'Blog updated successfully' };
    } catch (error) {
      throw new Error('Failed to update blog');
    }
  }
  public async deleteBlog(blogId: string, payload: JWTPayloadType) {
    try {
      const blog = await this.getBlogBy(blogId);
      if (blog.blogImage) {
        await this.removeBlogImage(blogId);
      }
      await this.blogsModel.deleteOne({ _id: blogId });
      return { message: 'Blog has been deleted successfully' };
    } catch (error) {
      throw new Error('Failed to delete blog');
    }
  }

  public async removeBlogImage(blogId: string) {
    const blog = await this.getBlogBy(blogId);
    if (!blog.blogImage) {
      throw new BadRequestException('There is no blog image');
    } else {
      const filename = blog.blogImage.split('/').pop();

      const imagePath = join(process.cwd(), `./images/blogs/${filename}`);
      try {
        unlinkSync(imagePath);
        await this.blogsModel.updateOne(
          { _id: blogId },
          { $set: { blogImage: null } },
        );
        return { message: 'Blog image removed successfully' };
      } catch (error) {
        throw new Error('Failed to remove blog image');
      }
    }
  }
}
