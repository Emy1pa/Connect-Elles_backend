import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthProvider } from './auth.provider';
import { UserRole } from 'src/utils/enums';
import { JwtService } from '@nestjs/jwt';

describe('AuthProvider - Register', () => {
  let service: AuthProvider;
  let userModel: any;
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockToken'),
  };

  const findOneMock = jest.fn();
  const saveMock = jest.fn();

  const MockUserModel = jest.fn().mockImplementation((userData) => ({
    ...userData,
    save: saveMock,
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthProvider,
        {
          provide: getModelToken('User'),
          useValue: Object.assign(MockUserModel, {
            findOne: findOneMock,
          }),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthProvider>(AuthProvider);
    userModel = module.get(getModelToken('User'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a user successfully', async () => {
    const registerDto = {
      username: 'testuser',
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'securePassword',
      profileImage: 'avatar.png',
    };

    findOneMock.mockResolvedValue(null);

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    saveMock.mockResolvedValue({
      _id: 'mockId123',
      username: registerDto.username,
      fullName: registerDto.fullName,
      email: registerDto.email,
      password: hashedPassword,
      profileImage: `/images/users/${registerDto.profileImage}`,
      userRole: UserRole.NORMAL_USER,
      isBanned: false,
    });

    const result = await service.register(registerDto);

    expect(result).toEqual({
      _id: 'mockId123',
      username: 'testuser',
      fullName: 'Test User',
      email: 'test@example.com',
      profileImage: '/images/users/avatar.png',
      userRole: UserRole.NORMAL_USER,
      isBanned: false,
    });

    expect(findOneMock).toHaveBeenCalledWith({ email: registerDto.email });
    expect(saveMock).toHaveBeenCalled();
  });

  it('should throw an error if user already exists', async () => {
    const registerDto = {
      username: 'testuser',
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'securePassword',
      profileImage: 'avatar.png',
    };

    findOneMock.mockResolvedValue({ email: registerDto.email });

    await expect(service.register(registerDto)).rejects.toThrow(
      BadRequestException,
    );

    expect(findOneMock).toHaveBeenCalledWith({ email: registerDto.email });
  });
});
