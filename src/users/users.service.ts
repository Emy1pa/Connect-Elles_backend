import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, Repository } from 'typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';
import { AccessTokenType, JWTPayloadType } from 'src/utils/types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  public async register(
    registerDto: RegisterDto,
  ): Promise<Omit<User, 'password'>> {
    const { username, fullName, email, password } = registerDto;
    const userFromDb = await this.userRepository.findOne({ where: { email } });
    if (userFromDb) throw new BadRequestException('User already registered');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let newUser = this.userRepository.create({
      username,
      fullName,
      email,
      password: hashedPassword,
    });
    newUser = await this.userRepository.save(newUser);
    const { password: _, ...userDetails } = newUser;
    return userDetails;
  }
  public async login(loginDto: LoginDto): Promise<AccessTokenType> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Invalid email or password');
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      throw new BadRequestException('Invalid email or password ');
    const accessToken = await this.generateJWT({
      id: user.id,
      userRole: user.userRole,
    });

    return { accessToken };
  }
  public async getCurrentUser(id: ObjectId): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new BadRequestException('Invalid email or password ');
    return user;
  }
  public getAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  private generateJWT(payload: JWTPayloadType) {
    return this.jwtService.signAsync(payload);
  }
}
