import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CategoriesService } from './categories.service';

import { Types } from 'mongoose';
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
  describe('getAllCategories', () => {
    it('should return all categories successfully', async () => {
      findMock.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCategories),
      });

      const result = await category.getAllCategories();

      expect(findMock).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ...mockCategories[0],
        user: mockCategories[0].user._id.toString(),
      });
      expect(result[1]).toEqual({
        ...mockCategories[1],
        user: mockCategories[1].user._id.toString(),
      });
    });

    it('should throw an error if categories retrieval fails', async () => {
      findMock.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(category.getAllCategories()).rejects.toThrow(
        'Failed to retrieve categories',
      );
      expect(findMock).toHaveBeenCalled();
    });
  });
  describe('deleteSkill', () => {
    let findByIdMock: jest.Mock;
    let deleteOneMock: jest.Mock;

    beforeEach(() => {
      findByIdMock = jest.fn();
      deleteOneMock = jest.fn();

      categoryModel.findById = findByIdMock;
      categoryModel.deleteOne = deleteOneMock;
    });

    it('should delete a category successfully', async () => {
      const mockSkill = {
        _id: mockCategoryId,
        title: 'Health Category',
        user: mockUserId,
      };

      findByIdMock.mockResolvedValue(mockSkill);
      deleteOneMock.mockResolvedValue({ deletedCount: 1 });

      const result = await category.deleteCategory(mockCategoryId);

      expect(findByIdMock).toHaveBeenCalledWith(mockCategoryId);
      expect(deleteOneMock).toHaveBeenCalledWith({ _id: mockCategoryId });
      expect(result).toEqual({ message: 'Category deleted successfully' });
    });

    it('should throw NotFoundException if skill is not found', async () => {
      findByIdMock.mockResolvedValue(null);

      await expect(category.deleteCategory(mockCategoryId)).rejects.toThrow(
        'Category not found',
      );
      expect(findByIdMock).toHaveBeenCalledWith(mockCategoryId);
      expect(deleteOneMock).not.toHaveBeenCalled();
    });

    it('should throw an error if skill deletion fails', async () => {
      const mockSkill = {
        _id: mockCategoryId,
        title: 'Health Category',
        user: mockUserId,
      };

      findByIdMock.mockResolvedValue(mockSkill);
      deleteOneMock.mockRejectedValue(new Error('Database error'));

      await expect(category.deleteCategory(mockCategoryId)).rejects.toThrow(
        'Failed to delete category',
      );
      expect(findByIdMock).toHaveBeenCalledWith(mockCategoryId);
      expect(deleteOneMock).toHaveBeenCalledWith({ _id: mockCategoryId });
    });
  });
});
