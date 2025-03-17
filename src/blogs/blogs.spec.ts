import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { BlogStatus } from 'src/utils/enums';
import { Types } from 'mongoose';

describe('BlogsService', () => {
  let blog: BlogsService;
  let blogModel: any;
  const mockBlogId = new Types.ObjectId().toString();
  const mockUserId = new Types.ObjectId().toString();
  const mockCategoryId = new Types.ObjectId().toString();

  const createMock = jest.fn();
  const saveMock = jest.fn();
  const findMock = jest.fn();

  const mockBlogs = [
    {
      _id: mockBlogId,
      title: 'Health Blog',
      summary: 'This is a blog about health.',
      content: 'This is a blog about health.',
      status: BlogStatus.PUBLISHED,
      user: { _id: mockUserId },
      category: { _id: mockCategoryId },
    },
    {
      _id: new Types.ObjectId().toString(),
      title: 'Health Blog',
      summary: 'This is a blog about health.',
      content: 'This is a blog about health.',
      status: BlogStatus.PUBLISHED,
      user: { _id: new Types.ObjectId().toString() },
      category: { _id: new Types.ObjectId().toString() },
    },
  ];

  const MockBlogModel = jest.fn().mockImplementation(() => ({
    save: saveMock,
    ...mockBlogs[0],
    toObject: jest.fn().mockReturnValue(mockBlogs[0]),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogsService,
        {
          provide: getModelToken('Blog'),
          useValue: Object.assign(MockBlogModel, {
            create: createMock,
            find: findMock,
          }),
        },
      ],
    }).compile();

    blog = module.get<BlogsService>(BlogsService);
    blogModel = module.get(getModelToken('Blog'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBlog', () => {
    it('should create a blog successfully', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Health Blog',
        summary: 'This is a blog about health.',
        content: 'This is a blog about health.',
        status: BlogStatus.PUBLISHED,
        categoryId: mockCategoryId,
      };

      const mockCreatedBlog = new MockBlogModel();
      mockCreatedBlog._id = new Types.ObjectId(mockBlogId);
      mockCreatedBlog.title = createBlogDto.title;
      mockCreatedBlog.content = createBlogDto.content;
      mockCreatedBlog.status = createBlogDto.status ?? BlogStatus.ARCHIVED;
      mockCreatedBlog.user = new Types.ObjectId(mockUserId);
      mockCreatedBlog.category = new Types.ObjectId(mockCategoryId);

      createMock.mockResolvedValue(mockCreatedBlog);

      const result = await blog.createBlog(
        createBlogDto,
        mockUserId,
        mockCategoryId,
      );

      expect(createMock).toHaveBeenCalledWith({
        ...createBlogDto,
        user: new Types.ObjectId(mockUserId),
        category: new Types.ObjectId(mockCategoryId),
        blogImage: null,
      });

      expect(result).toEqual({
        _id: mockBlogId,
        title: 'Health Blog',
        summary: 'This is a blog about health.',
        content: 'This is a blog about health.',
        status: BlogStatus.PUBLISHED,
        user: mockUserId,
        category: mockCategoryId,
      });
    });

    it('should throw an error if blog creation fails', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Health Blog',
        summary: 'This is a blog about health.',
        content: 'This is a blog about health.',
        status: BlogStatus.PUBLISHED,
        categoryId: mockCategoryId,
      };

      createMock.mockRejectedValue(new Error('Database error'));

      await expect(
        blog.createBlog(createBlogDto, mockUserId, mockCategoryId),
      ).rejects.toThrow('Failed to create blog');
    });
  });
  describe('getAllBlogs', () => {
    it('should return all blogs successfully', async () => {
      findMock.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockBlogs),
      });

      const result = await blog.getAllBlogs();

      expect(findMock).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ...mockBlogs[0],
        user: { _id: mockBlogs[0].user._id.toString() },
      });
      expect(result[1]).toEqual({
        ...mockBlogs[1],
        user: { _id: mockBlogs[1].user._id.toString() },
      });
    });

    it('should throw an error if blogs retrieval fails', async () => {
      findMock.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(blog.getAllBlogs()).rejects.toThrow(
        'Failed to retrieve blogs',
      );
      expect(findMock).toHaveBeenCalled();
    });
  });
});
