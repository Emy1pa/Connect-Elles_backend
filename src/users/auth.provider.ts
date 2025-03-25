import { BadRequestException } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { User, UserDocument } from './user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';
import { JWTPayloadType } from 'src/utils/types';
import { UserRole } from 'src/utils/enums';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class AuthProvider {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  public async register(registerDto: RegisterDto) {
    try {
      const { username, fullName, email, password, profileImage } = registerDto;
      const userFromDb = await this.userModel.findOne({ email });
      if (userFromDb) throw new BadRequestException('User already registered');
      const hashedPassword = await this.HashPassword(password);
      const newUser = new this.userModel({
        username,
        fullName,
        email,
        password: hashedPassword,
        profileImage: profileImage ? `/images/users/${profileImage}` : null,
        userRole: UserRole.NORMAL_USER,
        isBanned: false,
      });
      const savedUser = await newUser.save();
      const userResponse = {
        _id: savedUser._id.toString(),
        username: savedUser.username,
        fullName: savedUser.fullName,
        email: savedUser.email,
        profileImage: savedUser.profileImage,
        userRole: savedUser.userRole,
        isBanned: savedUser.isBanned,
      };

      return userResponse;
    } catch (error) {
      console.log('Registration failed', error);
      throw error;
    }
  }

  public async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('Invalid email or password');
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      throw new BadRequestException('Invalid email or password ');

    const accessToken = await this.generateJWT({
      id: user._id.toString(),
      userRole: user.userRole,
    });

    return { accessToken };
  }
  public async HashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
  private generateJWT(payload: JWTPayloadType) {
    return this.jwtService.signAsync(payload);
  }
}
