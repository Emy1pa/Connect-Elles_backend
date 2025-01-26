import { BadRequestException } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';
import { AccessTokenType, JWTPayloadType } from 'src/utils/types';

export class AuthProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  public async register(registerDto: RegisterDto): Promise<User> {
    const { username, fullName, email, password } = registerDto;
    const userFromDb = await this.userRepository.findOne({ where: { email } });
    if (userFromDb) throw new BadRequestException('User already registered');
    const hashedPassword = await this.HashPassword(password);
    let newUser = this.userRepository.create({
      username,
      fullName,
      email,
      password: hashedPassword,
    });
    newUser = await this.userRepository.save(newUser);
    return newUser;
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
  public async HashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
  private generateJWT(payload: JWTPayloadType) {
    return this.jwtService.signAsync(payload);
  }
}
