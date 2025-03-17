import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BlogStatus, ServiceStatus } from 'src/utils/enums';
import { Types } from 'mongoose';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dtos/create-service.dto';

describe('Services Service', () => {
  let service: ServicesService;
  let serviceModel: any;
  const mockServiceId = new Types.ObjectId().toString();
  const mockUserId = new Types.ObjectId().toString();
  const mockCategoryId = new Types.ObjectId().toString();

  const createMock = jest.fn();
  const saveMock = jest.fn();
  const findMock = jest.fn();

  const mockServices = [
    {
      _id: mockServiceId,
      title: 'Health Service',
      description: 'This is a service about health.',
      status: ServiceStatus.AVAILABLE,
      duration: 120,
      price: 150,
      numberOfPlaces: 10,
      user: { _id: mockUserId },
      category: { _id: mockCategoryId },
    },
    {
      _id: new Types.ObjectId().toString(),
      title: 'Health Service',
      description: 'This is a service about health.',
      status: ServiceStatus.AVAILABLE,
      duration: 120,
      price: 150,
      numberOfPlaces: 10,
      user: { _id: new Types.ObjectId().toString() },
      category: { _id: new Types.ObjectId().toString() },
    },
  ];

  const MockServiceModel = jest.fn().mockImplementation(() => ({
    save: saveMock,
    ...mockServices[0],
    toObject: jest.fn().mockReturnValue(mockServices[0]),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getModelToken('Service'),
          useValue: Object.assign(MockServiceModel, {
            create: createMock,
            find: findMock,
          }),
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    serviceModel = module.get(getModelToken('Service'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createService', () => {
    it('should create a service successfully', async () => {
      const createServiceDto: CreateServiceDto = {
        title: 'Health Service',
        description: 'This is a service about health.',
        status: ServiceStatus.AVAILABLE,
        duration: 120,
        price: 150,
        numberOfPlaces: 10,
        categoryId: mockCategoryId,
      };

      const mockCreatedService = new MockServiceModel();
      mockCreatedService._id = new Types.ObjectId(mockServiceId);
      mockCreatedService.title = createServiceDto.title;
      mockCreatedService.description = createServiceDto.description;
      mockCreatedService.status =
        createServiceDto.status ?? ServiceStatus.AVAILABLE;
      mockCreatedService.duration = createServiceDto.duration;
      mockCreatedService.price = createServiceDto.price;
      mockCreatedService.numberOfPlaces = createServiceDto.numberOfPlaces;
      mockCreatedService.user = new Types.ObjectId(mockUserId);
      mockCreatedService.category = new Types.ObjectId(mockCategoryId);

      createMock.mockResolvedValue(mockCreatedService);

      const result = await service.createService(
        createServiceDto,
        mockUserId,
        mockCategoryId,
      );

      expect(createMock).toHaveBeenCalledWith({
        ...createServiceDto,
        user: new Types.ObjectId(mockUserId),
        category: new Types.ObjectId(mockCategoryId),
        serviceImage: null,
      });

      expect(result).toEqual({
        _id: mockServiceId,
        title: 'Health Service',
        description: 'This is a service about health.',
        status: ServiceStatus.AVAILABLE,
        duration: 120,
        price: 150,
        numberOfPlaces: 10,
        user: mockUserId,
        category: mockCategoryId,
      });
    });

    it('should throw an error if service creation fails', async () => {
      const createServiceDto: CreateServiceDto = {
        title: 'Health Service',
        description: 'This is a service about health.',
        status: ServiceStatus.AVAILABLE,
        duration: 120,
        price: 150,
        numberOfPlaces: 10,
        categoryId: mockCategoryId,
      };

      createMock.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createService(createServiceDto, mockUserId, mockCategoryId),
      ).rejects.toThrow('Failed to create service');
    });
  });
  describe('getAllServices', () => {
    it('should return all services successfully', async () => {
      findMock.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockServices),
      });

      const result = await service.getAllServices();

      expect(findMock).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ...mockServices[0],
        user: { _id: mockServices[0].user._id.toString() },
      });
      expect(result[1]).toEqual({
        ...mockServices[1],
        user: { _id: mockServices[1].user._id.toString() },
      });
    });

    it('should throw an error if services retrieval fails', async () => {
      findMock.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.getAllServices()).rejects.toThrow(
        'Failed to retrieve services',
      );
      expect(findMock).toHaveBeenCalled();
    });
  });
});
