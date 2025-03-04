import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JWTPayloadType } from 'src/utils/types';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/user-role.decorator';
import { UserRole } from 'src/utils/enums';
import { AuthRolesGuard } from './guards/auth-roles.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { ClassSerializerInterceptor } from '@nestjs/common';

@Controller('api/users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('auth/register')
  @UseInterceptors(FileInterceptor('profileImage'))
  public register(
    @Body() registerDto: RegisterDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('File received:', file);

    if (file) {
      registerDto.profileImage = file.filename;
      console.log('File saved as:', file.filename);
    }
    return this.usersService.register(registerDto);
  }
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  public login(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }
  @Get('current-user')
  @UseGuards(AuthGuard)
  public getCurrentUser(@CurrentUser() payload: JWTPayloadType) {
    return this.usersService.getCurrentUser(payload.id);
  }
  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthRolesGuard)
  public getAllUsers() {
    return this.usersService.getAll();
  }
  @Put()
  @Roles(UserRole.ADMIN, UserRole.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(FileInterceptor('profileImage'))
  public updateUser(
    @CurrentUser() payload: JWTPayloadType,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('File received:', file);

    if (file) {
      updateUserDto.profileImage = file.filename;
      console.log(file.filename);
    }
    return this.usersService.update(payload.id, updateUserDto);
  }
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  public deleteUser(
    @Param('id') id: string,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.usersService.delete(id, payload);
  }

  @Get('admin/statistics')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  async getUsersStatistics() {
    return this.usersService.usersStatistics();
  }
}
