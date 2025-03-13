import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CategoriesService } from './categories.service';

import { Types } from 'mongoose';
import { CreateCategoryDto } from './dtos/create-category.dto';
describe('CategoriesService', () => {
  let category: CategoriesService;
  let categoryModel: any;

  const mockCategoryId = new Types.ObjectId().toString();
  const mockUserId = new Types.ObjectId().toString();

  const createMock = jest.fn();
  const findMock = jest.fn();
  const mockCategories = [
    {
      _id: mockCategoryId,
      title: 'Health Category',
      user: {
        _id: mockUserId,
        fullName: 'John Doe',
        email: 'john@example.com',
        userRole: 'normal-user',
      },
    },
    {
      _id: new Types.ObjectId().toString(),
      title: 'Relationship Category',
      user: {
        _id: new Types.ObjectId().toString(),
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        userRole: 'user',
      },
    },
  ];
  const MockCategoryModel = jest.fn().mockImplementation(() => ({
    toObject: jest.fn().mockReturnValue({
      _id: mockCategoryId,
      title: 'Health Category',
      user: mockUserId,
    }),
  }));
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getModelToken('Category'),
          useValue: Object.assign(MockCategoryModel, {
            create: createMock,
            find: findMock,
          }),
        },
      ],
    }).compile();
    category = module.get<CategoriesService>(CategoriesService);
    categoryModel = module.get(getModelToken('Category'));
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('CreateCategory', () => {
    it('should create a category successfully', async () => {
      const createCategoryDto = {
        title: 'Health Category',
      };

      const mockCreatedCategory = new MockCategoryModel();
      mockCreatedCategory._id = new Types.ObjectId(mockCategoryId);
      mockCreatedCategory.title = createCategoryDto.title;
      mockCreatedCategory.user = new Types.ObjectId(mockUserId);

      createMock.mockResolvedValue(mockCreatedCategory);

      const result = await category.CreateCategory(
        createCategoryDto,
        mockUserId,
      );

      expect(createMock).toHaveBeenCalledWith({
        ...createCategoryDto,
        user: new Types.ObjectId(mockUserId),
      });

      expect(result).toEqual({
        _id: mockCategoryId,
        title: 'Health Category',

        user: mockUserId,
      });
    });

    it('should throw an error if category creation fails', async () => {
      const createCategoryDto = {
        title: 'Health Category',
      };

      createMock.mockRejectedValue(new Error('Database error'));

      await expect(
        category.CreateCategory(createCategoryDto, mockUserId),
      ).rejects.toThrow('Failed to create category');

      expect(createMock).toHaveBeenCalledWith({
        ...createCategoryDto,
        user: new Types.ObjectId(mockUserId),
      });
    });
  });
});
