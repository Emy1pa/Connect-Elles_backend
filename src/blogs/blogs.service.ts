import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from './blog.entity';
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

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
  ) {}
  public async createBlog(
    createBlog: CreateBlogDto,
    userId: ObjectId | string,
    categoryId: ObjectId | string,
  ) {
    const { blogImage } = createBlog;
    const user = await this.usersService.getCurrentUser(userId);
    const category = await this.categoriesService.getCategoryBy(categoryId);
    let newBlog = await this.blogsRepository.create({
      ...createBlog,
      title: createBlog.title,
      content: createBlog.content,
      status: createBlog.status ?? BlogStatus.ARCHIVED,
      blogImage: blogImage ? `/images/blogs/${blogImage}` : null,
      user,
      category,
    });
    newBlog = await this.blogsRepository.save(newBlog);
    return newBlog;
  }
  public getAllBlogs() {
    return this.blogsRepository.find();
  }
  public getAllPublishedBlogs() {
    return this.blogsRepository.find({
      where: { status: BlogStatus.PUBLISHED },
    });
  }
  public async getBlogBy(id: ObjectId | string) {
    let objectId: ObjectId;
    try {
      objectId = typeof id === 'string' ? new ObjectId(id) : id;
    } catch (error) {
      throw new BadRequestException('Invalid ID format');
    }

    const blog = await this.blogsRepository.findOne({
      where: { _id: objectId },
    });
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }
  public async updateBlog(id: ObjectId | string, updateBlog: UpdateBlogDto) {
    const { blogImage } = updateBlog;
    const blog = await this.getBlogBy(id);
    blog.title = updateBlog.title ?? blog.title;
    blog.content = updateBlog.content ?? blog.content;
    blog.summary = updateBlog.content ?? blog.content;
    blog.status = updateBlog.status ?? blog.status;
    if (blogImage) {
      if (blog.blogImage) {
        await this.removeBlogImage(id);
      }
      blog.blogImage = blogImage;
    }
    return this.blogsRepository.save(blog);
  }
  public async deleteBlog(blogId: ObjectId | string, payload: JWTPayloadType) {
    const blog = await this.getBlogBy(blogId);
    if (blog.user._id.equals(new ObjectId(payload?.id))) {
      if (blog.blogImage) {
        await this.removeBlogImage(blogId);
      }
      await this.blogsRepository.remove(blog);
      return { message: 'Blog has been deleted successfully' };
    }
    throw new ForbiddenException(
      'You do not have permission to delete this blog',
    );
  }

  public async removeBlogImage(blogId: ObjectId | string) {
    const blog = await this.getBlogBy(blogId);
    if (!blog.blogImage) {
      throw new BadRequestException('There is no blog image');
    } else {
      const imagePath = join(process.cwd(), `./images/blogs/${blog.blogImage}`);
      unlinkSync(imagePath);
      blog.blogImage = null;
      return this.blogsRepository.save(blog);
    }
  }
}
