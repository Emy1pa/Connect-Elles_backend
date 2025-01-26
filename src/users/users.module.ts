import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuthProvider } from './auth.provider';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          global: true,
          secret: config.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') },
        };
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UsersService, AuthProvider],
  controllers: [UsersController],
})
export class UsersModule {}
