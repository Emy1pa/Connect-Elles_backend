import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { AuthProvider } from './auth.provider';

describe('UsersService', () => {
  let usersService: UsersService;
  let mockAuthProvider: any;
  let mockUserModel: any;
  beforeEach(async () => {
    mockUserModel = {
      findById: jest.fn(),
      find: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
        {
          provide: AuthProvider,
          useValue: mockAuthProvider,
        },
      ],
    }).compile();
    usersService = module.get<UsersService>(UsersService);
  });

  it('should user service to be defined', () => {
    expect(usersService).toBeDefined();
  });
  it('should return all users with string IDs', async () => {
    const mockUsers = [
      {
        _id: { toString: () => '1' },
        username: 'user1',
        email: 'user1@example.com',
        fullName: 'User One',
      },
      {
        _id: { toString: () => '2' },
        username: 'user2',
        email: 'user2@example.com',
        fullName: 'User Two',
      },
    ];

    const mockFind = {
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockUsers),
    };

    mockUserModel.find = jest.fn().mockReturnValue(mockFind);

    const result = await usersService.getAll();

    expect(mockUserModel.find).toHaveBeenCalled();
    expect(mockFind.lean).toHaveBeenCalled();
    expect(mockFind.exec).toHaveBeenCalled();

    expect(result).toEqual([
      {
        _id: '1',
        username: 'user1',
        email: 'user1@example.com',
        fullName: 'User One',
      },
      {
        _id: '2',
        username: 'user2',
        email: 'user2@example.com',
        fullName: 'User Two',
      },
    ]);
  });
});
