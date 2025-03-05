import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthRolesGuard } from 'src/users/guards/auth-roles.guard';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { UserRole } from 'src/utils/enums';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { JWTPayloadType } from 'src/utils/types';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dtos/create-service.dto';
import { UpdateServiceDto } from './dtos/update-blog.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('serviceImage'))
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  public createNewService(
    @Body() createService: CreateServiceDto,
    @CurrentUser() payload: JWTPayloadType,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('File received:', file);

    if (file) {
      createService.serviceImage = file.filename;
      console.log('File saved as:', file.filename);
    }
    return this.servicesService.createService(
      createService,
      payload.id,
      createService.categoryId,
    );
  }
  @Get()
  public getAllServices() {
    return this.servicesService.getAllServices();
  }

  @Get(':id')
  public getServiceById(@Param('id') id: string) {
    return this.servicesService.getServiceBy(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('serviceImage'))
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  public updateService(
    @Param('id') id: string,
    @Body() updateService: UpdateServiceDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('File received:', file);

    if (file) {
      updateService.serviceImage = file.filename;
      console.log('File saved as:', file.filename);
    }
    return this.servicesService.updateService(id, updateService);
  }
  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  public deleteService(@Param('id') id: string, payload: JWTPayloadType) {
    return this.servicesService.deleteService(id, payload);
  }

  @Get('statistics/:mentorId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  async getServicesStatistics(@Param('mentorId') mentorId: string) {
    return this.servicesService.getServicesCount(mentorId);
  }

  @Get('admin/statistics')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminStatistics() {
    return this.servicesService.getAdminStatistics();
  }

  @Get('mentor/:mentorId')
  async getServicesByMentor(@Param('mentorId') mentorId: string) {
    return this.servicesService.getMentorServices(mentorId);
  }
}
