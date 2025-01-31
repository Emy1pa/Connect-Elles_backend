import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { ObjectId } from 'mongodb';
import { BlogStatus, ServiceStatus } from 'src/utils/enums';
import { CategoriesService } from 'src/categories/categories.service';
import { join } from 'path';
import { unlinkSync } from 'fs';
import { JWTPayloadType } from 'src/utils/types';
import { Service } from './service.entity';
import { CreateServiceDto } from './dtos/create-service.dto';
import { UpdateServiceDto } from './dtos/update-blog.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
  ) {}
  public async createService(
    createService: CreateServiceDto,
    userId: ObjectId | string,
    categoryId: ObjectId | string,
  ) {
    const { serviceImage } = createService;
    const user = await this.usersService.getCurrentUser(userId);
    const category = await this.categoriesService.getCategoryBy(categoryId);
    let newService = await this.servicesRepository.create({
      ...createService,
      title: createService.title,
      description: createService.description,
      status: createService.status ?? ServiceStatus.AVAILABLE,

      serviceImage: serviceImage ? `/images/blogs/${serviceImage}` : null,
      duration: createService.duration,
      price: createService.price,
      numberOfPlaces: createService.numberOfPlaces,
      user,
      category,
    });
    newService = await this.servicesRepository.save(newService);
    return newService;
  }
  public getAllServices() {
    return this.servicesRepository.find();
  }

  public async getServiceBy(id: ObjectId | string) {
    let objectId: ObjectId;
    try {
      objectId = typeof id === 'string' ? new ObjectId(id) : id;
    } catch (error) {
      throw new BadRequestException('Invalid ID format');
    }

    const service = await this.servicesRepository.findOne({
      where: { _id: objectId },
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }
  public async updateService(
    id: ObjectId | string,
    updateService: UpdateServiceDto,
  ) {
    const { serviceImage } = updateService;
    const service = await this.getServiceBy(id);
    service.title = updateService.title ?? service.title;
    service.description = updateService.description ?? service.description;
    service.duration = updateService.duration ?? service.duration;
    service.price = updateService.price ?? service.price;
    service.numberOfPlaces =
      updateService.numberOfPlaces ?? service.numberOfPlaces;
    service.status = updateService.status ?? service.status;
    if (serviceImage) {
      if (service.serviceImage) {
        await this.removeServiceImage(id);
      }
      service.serviceImage = serviceImage;
    }
    return this.servicesRepository.save(service);
  }
  public async deleteService(
    serviceId: ObjectId | string,
    payload: JWTPayloadType,
  ) {
    const service = await this.getServiceBy(serviceId);
    if (service.user._id.equals(new ObjectId(payload?.id))) {
      if (service.serviceImage) {
        await this.removeServiceImage(serviceId);
      }
      await this.servicesRepository.remove(service);
      return { message: 'Service has been deleted successfully' };
    }
    throw new ForbiddenException(
      'You do not have permission to delete this Service',
    );
  }

  public async removeServiceImage(serviceId: ObjectId | string) {
    const service = await this.getServiceBy(serviceId);
    if (!service.serviceImage) {
      throw new BadRequestException('There is no service image');
    } else {
      const imagePath = join(
        process.cwd(),
        `./images/services/${service.serviceImage}`,
      );
      unlinkSync(imagePath);
      service.serviceImage = null;
      return this.servicesRepository.save(service);
    }
  }
}
