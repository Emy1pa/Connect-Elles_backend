import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CURRENT_USER_KEY } from 'src/utils/constants';
import { JWTPayloadType } from 'src/utils/types';
import { UsersService } from '../users.service';
import { UserRole } from 'src/utils/enums';

@Injectable()
export class AuthRolesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roles: UserRole[] = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles && roles.length === 0) return false;
    const request: Request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new UnauthorizedException('Authorization header missing');
    }
    const [type, token] = authorization.split(' ') ?? [];
    if (token && type === 'Bearer') {
      try {
        const payload: JWTPayloadType = await this.jwtService.verifyAsync(
          token,
          {
            secret: this.config.get<string>('JWT_SECRET'),
          },
        );
        const user = await this.usersService.getCurrentUser(payload.id);
        if (!user) return false;
        if (roles.includes(user.userRole)) {
          request[CURRENT_USER_KEY] = payload;
          return true;
        }
      } catch (error) {
        console.log('error', error);
        throw new UnauthorizedException('Access denied, invalid token');
      }
    } else {
      throw new UnauthorizedException('Access denied, No token provided');
    }
    return false;
  }
}
