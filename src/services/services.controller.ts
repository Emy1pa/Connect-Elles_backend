import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthRolesGuard } from 'src/users/guards/auth-roles.guard';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { UserRole } from 'src/utils/enums';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { JWTPayloadType } from 'src/utils/types';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dtos/create-service.dto';
import { UpdateServiceDto } from './dtos/update-blog.dto';

@Controller('api/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  public createNewService(
    @Body() createService: CreateServiceDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
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

  @Put(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  public updateService(
    @Param('id') id: string,
    @Body() updateService: UpdateServiceDto,
  ) {
    return this.servicesService.updateService(id, updateService);
  }
  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.MENTOR)
  public deleteService(@Param('id') id: string, payload: JWTPayloadType) {
    return this.servicesService.deleteService(id, payload);
  }
}
