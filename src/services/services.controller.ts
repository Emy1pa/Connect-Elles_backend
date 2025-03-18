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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
@ApiTags('Services')
@ApiBearerAuth()
@Controller('api/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau service' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Données du service avec une image',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        categoryId: { type: 'string' },
        serviceImage: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Service créé avec succès.' })
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
  @ApiOperation({ summary: 'Récupérer tous les services' })
  @ApiResponse({ status: 200, description: 'Liste des services retournée.' })
  public getAllServices() {
    return this.servicesService.getAllServices();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un service par ID' })
  @ApiParam({ name: 'id', description: 'ID du service' })
  public getServiceById(@Param('id') id: string) {
    return this.servicesService.getServiceBy(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un service' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID du service' })
  @ApiBody({
    description: 'Données à mettre à jour avec une image (optionnelle)',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        categoryId: { type: 'string' },
        serviceImage: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
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
  @ApiOperation({ summary: 'Supprimer un service' })
  @ApiParam({ name: 'id', description: 'ID du service à supprimer' })
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  public deleteService(@Param('id') id: string, payload: JWTPayloadType) {
    return this.servicesService.deleteService(id, payload);
  }

  @Get('statistics/:mentorId')
  @ApiOperation({ summary: 'Statistiques des services d’un mentor' })
  @ApiParam({ name: 'mentorId', description: 'ID du mentor' })
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  async getServicesStatistics(@Param('mentorId') mentorId: string) {
    return this.servicesService.getServicesCount(mentorId);
  }

  @Get('admin/statistics')
  @ApiOperation({ summary: 'Statistiques globales pour l’admin' })
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminStatistics() {
    return this.servicesService.getAdminStatistics();
  }

  @Get('mentor/:mentorId')
  @ApiOperation({ summary: 'Services d’un mentor' })
  @ApiParam({ name: 'mentorId', description: 'ID du mentor' })
  async getServicesByMentor(@Param('mentorId') mentorId: string) {
    return this.servicesService.getMentorServices(mentorId);
  }
}
