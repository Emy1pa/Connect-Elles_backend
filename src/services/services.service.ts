import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ServiceStatus } from 'src/utils/enums';
import { join } from 'path';
import { unlinkSync } from 'fs';
import { JWTPayloadType } from 'src/utils/types';
import { Service, ServiceDocument } from './service.schema';
import { CreateServiceDto } from './dtos/create-service.dto';
import { UpdateServiceDto } from './dtos/update-blog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name)
    private readonly servicesModel: Model<ServiceDocument>,
  ) {}
  public async createService(
    createService: CreateServiceDto,
    userId: string,
    categoryId: string,
  ) {
    try {
      const { serviceImage } = createService;
      let newService = await this.servicesModel.create({
        ...createService,
        title: createService.title,
        description: createService.description,
        status: createService.status ?? ServiceStatus.AVAILABLE,
        serviceImage: serviceImage ? `/images/services/${serviceImage}` : null,
        duration: createService.duration,
        price: createService.price,
        numberOfPlaces: createService.numberOfPlaces,
        user: new Types.ObjectId(userId),
        category: new Types.ObjectId(categoryId),
      });
      const savedService = await this.servicesModel
        .findById(newService._id)
        .lean()
        .exec();
      return {
        ...savedService,
        _id: savedService._id.toString(),
        user: savedService.user.toString(),
        category: savedService.category.toString(),
      };
    } catch (error) {
      throw new Error('Failed to create service');
    }
  }
  public async getAllServices() {
    try {
      const services = await this.servicesModel.find().lean().exec();
      return services.map((service) => ({
        ...service,
        _id: service._id.toString(),
        user: {
          _id: (service.user as any)._id.toString(),
        },
        category: {
          _id: (service.category as any)._id.toString(),
        },
      }));
    } catch (error) {
      throw new Error('Failed to retrieve services');
    }
  }

  public async getServiceBy(id: string) {
    try {
      const service = await this.servicesModel
        .findById(id.toString())
        .populate('user', '_id fullName')
        .populate('category', '_id title')
        .lean()
        .exec();
      if (!service) throw new NotFoundException('Service not found');
      return {
        ...service,
        _id: service._id.toString(),
        user: service.user
          ? {
              ...(service.user as any),
              _id: (service.user as any)._id.toString(),
            }
          : null,
        category: service.category
          ? {
              ...(service.category as any),
              _id: (service.category as any)._id.toString(),
            }
          : null,
      };
    } catch (error) {
      throw new Error('Failed to retrieve service');
    }
  }
  public async updateService(id: string, updateService: UpdateServiceDto) {
    try {
      const { serviceImage } = updateService;
      const service = await this.getServiceBy(id);

      if (serviceImage && service.serviceImage) {
        await this.removeServiceImage(id);
      }
      const result = await this.servicesModel.updateOne(
        { _id: id },
        {
          $set: {
            ...updateService,
            serviceImage: serviceImage
              ? `/images/services/${serviceImage}`
              : service.serviceImage,
          },
        },
      );

      if (result.modifiedCount === 0) {
        throw new Error('Failed to update service');
      }

      return { message: 'Service updated successfully' };
    } catch (error) {
      console.error('Error updating service:', error);
      throw new BadRequestException('Failed to update service');
    }
  }
  public async deleteService(serviceId: string, payload: JWTPayloadType) {
    try {
      const service = await this.getServiceBy(serviceId);
      if (service.serviceImage) {
        await this.removeServiceImage(serviceId);
      }
      await this.servicesModel.deleteOne({ _id: serviceId });
      return { message: 'Service has been deleted successfully' };
    } catch (error) {
      throw new Error('Failed to delete service');
    }
  }

  public async removeServiceImage(serviceId: string) {
    const service = await this.getServiceBy(serviceId);
    if (!service.serviceImage) {
      throw new BadRequestException('There is no service image');
    } else {
      const filename = service.serviceImage.split('/').pop();
      console.log('filename is ', filename);

      const imagePath = join(process.cwd(), `./images/services/${filename}`);
      console.log(service.serviceImage);
      try {
        unlinkSync(imagePath);
        await this.servicesModel.updateOne(
          { _id: serviceId },
          { $set: { serviceImage: null } },
        );
        return { message: 'Service image removed successfully' };
      } catch (error) {
        throw new Error('Failed to remove service image');
      }
    }
  }
}
