import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { AccessTokenType, JWTPayloadType } from 'src/utils/types';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserRole } from 'src/utils/enums';
import { AuthProvider } from './auth.provider';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authProvider: AuthProvider,
  ) {}
  public async register(registerDto: RegisterDto): Promise<User> {
    return this.authProvider.register(registerDto);
  }
  public async login(loginDto: LoginDto): Promise<AccessTokenType> {
    return this.authProvider.login(loginDto);
  }
  public async getCurrentUser(id: ObjectId): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new BadRequestException('User not found');
    return user;
  }
  public getAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  public async update(id: ObjectId, updateUserDto: UpdateUserDto) {
    const { password, fullName, username } = updateUserDto;
    const user = await this.userRepository.findOne({ where: { id } });
    user.username = username ?? user.username;
    user.fullName = fullName ?? user.fullName;
    if (password) {
      user.password = await this.authProvider.HashPassword(password);
    }
    return this.userRepository.save(user);
  }

  public async delete(userId: ObjectId, payload: JWTPayloadType) {
    const user = await this.getCurrentUser(userId);
    if (user.id === payload?.id || payload.userRole === UserRole.ADMIN) {
      await this.userRepository.remove(user);
      return { message: 'User has been deleted successfully' };
    }
    throw new ForbiddenException(
      'You do not have permission to delete this user',
    );
  }

  public async changeUserRole(
    id: ObjectId,
    newRole: UserRole,
    payload: JWTPayloadType,
  ): Promise<User> {
    if (payload.userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to change user roles',
      );
    }
    const user = await this.getCurrentUser(id);
    user.userRole = newRole;
    return this.userRepository.save(user);
  }
}
