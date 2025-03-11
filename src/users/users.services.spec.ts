import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { AuthProvider } from './auth.provider';

describe('UsersService', () => {
  let usersService: UsersService;
  const mockAuthProvider = {};
  const mockUserModel = {};
  beforeEach(async () => {
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
});
