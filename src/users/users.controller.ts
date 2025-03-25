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
import { ClassSerializerInterceptor } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
@ApiTags('Users')
@Controller('api/users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('auth/register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'User successfully registered' })
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
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @HttpCode(HttpStatus.OK)
  public login(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }
  @Get('current-user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get currently logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'Current user retrieved successfully',
  })
  @UseGuards(AuthGuard)
  public getCurrentUser(@CurrentUser() payload: JWTPayloadType) {
    return this.usersService.getCurrentUser(payload.id);
  }
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'All users retrieved successfully' })
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthRolesGuard)
  public getAllUsers() {
    return this.usersService.getAll();
  }
  @Put()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user profile' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'User updated successfully' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @Roles(UserRole.ADMIN, UserRole.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  public deleteUser(
    @Param('id') id: string,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.usersService.delete(id, payload);
  }

  @Get('admin/statistics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  async getUsersStatistics() {
    return this.usersService.usersStatistics();
  }

  @Get('mentors')
  @ApiOperation({ summary: 'Get all mentors' })
  @ApiResponse({
    status: 200,
    description: 'List of mentors retrieved successfully',
  })
  public async getMentors() {
    return this.usersService.getMentors();
  }
}
