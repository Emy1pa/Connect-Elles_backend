import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { BlogStatus } from 'src/utils/enums';
import { Types } from 'mongoose';

describe('BlogsService', () => {
  let service: BlogsService;
  let blogModel: any;

  const mockBlogId = new Types.ObjectId().toString();
  const mockUserId = new Types.ObjectId().toString();
  const mockCategoryId = new Types.ObjectId().toString();

  const createMock = jest.fn();
  const saveMock = jest.fn();

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
          }),
        },
      ],
    }).compile();

    service = module.get<BlogsService>(BlogsService);
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

      const result = await service.createBlog(
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
        service.createBlog(createBlogDto, mockUserId, mockCategoryId),
      ).rejects.toThrow('Failed to create blog');
    });
  });
});
