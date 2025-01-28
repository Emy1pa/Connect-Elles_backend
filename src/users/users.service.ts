import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { AccessTokenType, JWTPayloadType } from 'src/utils/types';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserRole } from 'src/utils/enums';
import { AuthProvider } from './auth.provider';
import { join } from 'path';
import { unlinkSync } from 'fs';
import { ObjectId } from 'mongodb';

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
  public async getCurrentUser(id: ObjectId | string): Promise<User> {
    let objectId: ObjectId;
    try {
      objectId = typeof id === 'string' ? new ObjectId(id) : id;
    } catch (error) {
      throw new BadRequestException('Invalid ID format');
    }

    const user = await this.userRepository.findOne({
      where: { _id: objectId },
    });
    if (!user) throw new BadRequestException('User not found');
    return user;
  }
  public getAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  public async update(id: string | ObjectId, updateUserDto: UpdateUserDto) {
    const { password, fullName, username, profileImage } = updateUserDto;
    let objectId: ObjectId;
    try {
      objectId = typeof id === 'string' ? new ObjectId(id) : id;
    } catch (error) {
      throw new BadRequestException('Invalid ID format');
    }

    const user = await this.userRepository.findOne({
      where: { _id: objectId },
    });

    user.username = username ?? user.username;
    user.fullName = fullName ?? user.fullName;
    if (password) {
      user.password = await this.authProvider.HashPassword(password);
    }
    if (profileImage) {
      if (user.profileImage) {
        await this.removeProfileImage(id);
      }
      user.profileImage = profileImage;
    }
    return this.userRepository.save(user);
  }

  public async delete(userId: string | ObjectId, payload: JWTPayloadType) {
    const user = await this.getCurrentUser(userId);
    if (
      user._id.equals(new ObjectId(payload?.id)) ||
      payload.userRole === UserRole.ADMIN
    ) {
      await this.userRepository.remove(user);
      return { message: 'User has been deleted successfully' };
    }
    throw new ForbiddenException(
      'You do not have permission to delete this user',
    );
  }

  public async changeUserRole(
    id: string | ObjectId,
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
  public async removeProfileImage(userId: ObjectId | string) {
    const user = await this.getCurrentUser(userId);
    if (!user.profileImage) {
      throw new BadRequestException('There is no profile image');
    } else {
      const imagePath = join(
        process.cwd(),
        `./images/users/${user.profileImage}`,
      );
      unlinkSync(imagePath);
      user.profileImage = null;
      return this.userRepository.save(user);
    }
  }
}
