import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { AuthProvider } from './auth.provider';
import { ForbiddenException } from '@nestjs/common';
import { UserRole } from 'src/utils/enums';

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
  describe('delete', () => {
    const userId = '123';
    const mockUser = {
      _id: { toString: () => userId },
      username: 'testuser',
      email: 'test@example.com',
    };

    beforeEach(() => {
      mockUserModel.findByIdAndDelete = jest.fn().mockResolvedValue(true);

      usersService.getCurrentUser = jest.fn().mockResolvedValue(mockUser);
    });

    it('should allow users to delete their own account', async () => {
      const payload = {
        id: userId,
        userRole: UserRole.NORMAL_USER,
      };

      const result = await usersService.delete(userId, payload);

      expect(usersService.getCurrentUser).toHaveBeenCalledWith(userId);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockUser._id,
      );
      expect(result).toEqual({ message: 'User has been deleted successfully' });
    });

    it('should allow admins to delete any user account', async () => {
      const adminPayload = {
        id: 'admin123',
        userRole: UserRole.ADMIN,
      };

      const result = await usersService.delete(userId, adminPayload);

      expect(usersService.getCurrentUser).toHaveBeenCalledWith(userId);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockUser._id,
      );
      expect(result).toEqual({ message: 'User has been deleted successfully' });
    });

    it("should throw ForbiddenException if a user tries to delete another user's account", async () => {
      const otherUserPayload = {
        id: 'other456',
        userRole: UserRole.NORMAL_USER,
      };

      await expect(
        usersService.delete(userId, otherUserPayload),
      ).rejects.toThrow(ForbiddenException);

      expect(usersService.getCurrentUser).toHaveBeenCalledWith(userId);
      expect(mockUserModel.findByIdAndDelete).not.toHaveBeenCalled();
    });
  });
});
