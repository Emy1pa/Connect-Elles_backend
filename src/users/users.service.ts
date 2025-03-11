import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JWTPayloadType } from 'src/utils/types';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserRole } from 'src/utils/enums';
import { AuthProvider } from './auth.provider';
import { join } from 'path';
import { unlinkSync } from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly authProvider: AuthProvider,
  ) {}
  public async register(registerDto: RegisterDto) {
    return this.authProvider.register(registerDto);
  }
  public async login(loginDto: LoginDto) {
    return this.authProvider.login(loginDto);
  }
  public async getCurrentUser(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).lean().exec();

    if (!user) throw new BadRequestException('User not found');
    user._id = user._id.toString();

    return user;
  }
  public async getAll(): Promise<User[]> {
    const users = await this.userModel.find().lean().exec();
    users.forEach((user) => {
      user._id = user._id.toString();
    });
    return users;
  }

  public async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, fullName, username, profileImage } = updateUserDto;

    const user = await this.userModel.findById(id);
    if (!user) throw new BadRequestException('User not found');

    if (username) user.username = username;
    if (fullName) user.fullName = fullName;
    if (password) {
      user.password = await this.authProvider.HashPassword(password);
    }
    if (profileImage) {
      if (user.profileImage) {
        await this.removeProfileImage(id);
      }
      user.profileImage = `/images/users/${profileImage}`;
    }
    const updatedUser = await user.save();
    return {
      _id: updatedUser._id.toString(),
      username: updatedUser.username,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage,
      userRole: updatedUser.userRole,
      isBanned: updatedUser.isBanned,
    };
  }

  public async delete(userId: string, payload: JWTPayloadType) {
    const user = await this.getCurrentUser(userId);
    if (
      user._id.toString() === payload.id.toString() ||
      payload.userRole === UserRole.ADMIN
    ) {
      await this.userModel.findByIdAndDelete(user._id);
      return { message: 'User has been deleted successfully' };
    }
    throw new ForbiddenException(
      'You do not have permission to delete this user',
    );
  }

  public async removeProfileImage(userId: string) {
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
      return user.save();
    }
  }

  public async usersStatistics() {
    try {
      const totalCount = await this.userModel.countDocuments();
      const mentorCount = await this.userModel.countDocuments({
        userRole: UserRole.MENTOR,
      });
      const userCount = await this.userModel.countDocuments({
        userRole: UserRole.NORMAL_USER,
      });
      const adminCount = await this.userModel.countDocuments({
        userRole: UserRole.ADMIN,
      });

      return {
        total: totalCount,
        admin: adminCount,
        user: userCount,
        mentor: mentorCount,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to get users statistics: ${error.message}`,
      );
    }
  }

  public async getMentors() {
    const mentors = await this.userModel
      .find({ userRole: UserRole.MENTOR })
      .select('_id fullName email profileImage username')
      .lean()
      .exec();
    return mentors.map((mentor) => ({
      ...mentor,
      _id: mentor._id.toString(),
    }));
  }
}
