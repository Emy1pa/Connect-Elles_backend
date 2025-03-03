import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reservation, ReservationDocument } from './reservation.schema';
import { User, UserDocument } from 'src/users/user.schema';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from 'src/services/service.schema';
import { CreateReservationDto } from './dtos/create-reservation.dto';
import { luhnCheck } from 'src/utils/card-validator';
import { ReservationStatus, ServiceStatus, UserRole } from 'src/utils/enums';

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Service.name)
    private serviceModel: Model<ServiceDocument>,
  ) {}

  public async createReservation(
    createReservation: CreateReservationDto,
    userId: string,
    serviceId: string,
  ) {
    try {
      const existingUser = await this.userModel.findById(userId);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }
      const existingService = await this.serviceModel.findById(serviceId);
      if (!existingService) {
        throw new NotFoundException('Service not found');
      }
      if (existingService.numberOfPlaces <= 0) {
        throw new BadRequestException('No available places for this service');
      }
      if (!luhnCheck(createReservation.cardNumber)) {
        throw new BadRequestException('Invalid card number');
      }
      const [month, year] = createReservation.cardExpiry.split('/');
      const expiryDate = new Date(
        2000 + parseInt(year),
        parseInt(month) - 1,
        1,
      );
      const today = new Date();
      if (expiryDate < today) {
        throw new BadRequestException('Card has expired');
      }
      const lastFourDigits = createReservation.cardNumber.slice(-4);
      const maskCardNumber = `xxxx-xxxx-xxxx-${lastFourDigits}`;
      let newReservation = await this.reservationModel.create({
        ...createReservation,
        cardNumber: maskCardNumber,
        status: ReservationStatus.PENDING,
        user: new Types.ObjectId(userId),
        service: new Types.ObjectId(serviceId),
      });
      await this.serviceModel.findByIdAndUpdate(
        serviceId,
        { $inc: { numberOfPlaces: -1 } },
        { new: true },
      );
      const updatedService = await this.serviceModel.findById(serviceId);
      if (updatedService && updatedService.numberOfPlaces === 0) {
        await this.serviceModel.findByIdAndUpdate(
          serviceId,
          { status: ServiceStatus.NOT_AVAILABLE },
          { new: true },
        );
      }
      const populatedReservation = await this.reservationModel
        .findById(newReservation._id)
        .populate('user', '_id fullName email')
        .populate('service', '_id name price description')
        .exec();
      if (!populatedReservation) {
        throw new Error('Failed to retrieve created reservation');
      }
      return {
        ...populatedReservation.toObject(),
        _id: populatedReservation._id.toString(),
        user: {
          _id: populatedReservation.user._id.toString(),
          fullName: (populatedReservation.user as any).fullName,
          email: (populatedReservation.user as any).email,
        },
        service: {
          _id: populatedReservation.service._id.toString(),
          name: (populatedReservation.service as any).name,
          price: (populatedReservation.service as any).price,
          description: (populatedReservation.service as any).description,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create reservation: ${error.message}`,
      );
    }
  }
  async getAllReservations() {
    try {
      const reservations = await this.reservationModel
        .find()
        .populate('user', '_id fullName email')
        .populate('service', '_id name price description')
        .lean()
        .exec();

      return reservations.map((reservation) => ({
        ...reservation,
        _id: reservation._id.toString(),
        user: reservation.user
          ? {
              _id: reservation.user._id.toString(),
              fullName: (reservation.user as any).fullName,
              email: (reservation.user as any).email,
            }
          : null,
        service: reservation.service
          ? {
              _id: reservation.service._id.toString(),
              name: (reservation.service as any).name,
              price: (reservation.service as any).price,
              description: (reservation.service as any).description,
            }
          : null,
      }));
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve reservations: ${error.message}`,
      );
    }
  }
  async getUserReservations(userId: string) {
    try {
      const existingUser = await this.userModel.findById(userId);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      const reservations = await this.reservationModel
        .find({
          user: new Types.ObjectId(userId),
        })
        .populate('service', '_id name price serviceImage duration')
        .lean()
        .exec();

      return reservations.map((reservation) => ({
        _id: reservation._id.toString(),
        reservationDate: reservation.reservationDate,
        status: reservation.reservationStatus,
        cardNumber: reservation.cardNumber,
        service: reservation.service
          ? {
              _id: reservation.service._id.toString(),
              name: (reservation.service as any).name,
              price: (reservation.service as any).price,
              serviceImage: (reservation.service as any).serviceImage,
              duration: (reservation.service as any).duration,
            }
          : null,
      }));
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve user reservations: ${error.message}`,
      );
    }
  }
  async getReservationById(id: string) {
    try {
      const reservation = await this.reservationModel
        .findById(id)
        .populate('user', '_id fullName email')
        .populate('service', '_id name price description')
        .lean()
        .exec();

      if (!reservation) {
        throw new NotFoundException('Reservation not found');
      }

      return {
        ...reservation,
        _id: reservation._id.toString(),
        user: reservation.user
          ? {
              _id: reservation.user._id.toString(),
              fullName: (reservation.user as any).fullName,
              email: (reservation.user as any).email,
            }
          : null,
        service: reservation.service
          ? {
              _id: reservation.service._id.toString(),
              name: (reservation.service as any).name,
              price: (reservation.service as any).price,
              description: (reservation.service as any).description,
            }
          : null,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve reservation: ${error.message}`,
      );
    }
  }
  async updateReservationStatus(
    reservationId: string,
    userId: string,
    newStatus: ReservationStatus,
    isMentor: boolean,
  ) {
    try {
      const reservation = await this.reservationModel.findById(reservationId);
      if (!reservation) {
        throw new NotFoundException('Reservation not found');
      }

      if (!isMentor && reservation.user.toString() !== userId) {
        throw new BadRequestException(
          'You can only update your own reservations',
        );
      }

      if (reservation.reservationStatus !== ReservationStatus.PENDING) {
        throw new BadRequestException(
          'Only pending reservations can be updated',
        );
      }

      if (!isMentor && newStatus !== ReservationStatus.CANCELED) {
        throw new BadRequestException('You can only cancel your reservations');
      }

      if (isMentor && newStatus !== ReservationStatus.CONFIRMED) {
        throw new BadRequestException('Mentors can only confirm reservations');
      }

      reservation.reservationStatus = newStatus;
      await reservation.save();
      if (newStatus === ReservationStatus.CANCELED) {
        const serviceId = reservation.service.toString();
        const service = await this.serviceModel.findById(serviceId);

        if (service) {
          service.numberOfPlaces += 1;

          if (
            service.status === ServiceStatus.NOT_AVAILABLE &&
            service.numberOfPlaces >= 1
          ) {
            service.status = ServiceStatus.AVAILABLE;
          }

          await service.save();
        }
      }

      const updatedReservation = await this.reservationModel
        .findById(reservationId)
        .populate('user', '_id fullName email')
        .populate('service', '_id name price description')
        .lean()
        .exec();

      if (!updatedReservation) {
        throw new Error('Failed to retrieve updated reservation');
      }

      return {
        ...updatedReservation,
        _id: updatedReservation._id.toString(),
        user: updatedReservation.user
          ? {
              _id: updatedReservation.user._id.toString(),
              fullName: (updatedReservation.user as any).fullName,
              email: (updatedReservation.user as any).email,
            }
          : null,
        service: updatedReservation.service
          ? {
              _id: updatedReservation.service._id.toString(),
              name: (updatedReservation.service as any).name,
              price: (updatedReservation.service as any).price,
              description: (updatedReservation.service as any).description,
            }
          : null,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to update reservation status: ${error.message}`,
      );
    }
  }

  async getReservationStatistics(userId: string) {
    try {
      const userObjectId = new Types.ObjectId(userId);

      const totalCount = await this.reservationModel.countDocuments({
        user: userObjectId,
      });

      const pendingCount = await this.reservationModel.countDocuments({
        user: userObjectId,
        reservationStatus: ReservationStatus.PENDING,
      });

      const confirmedCount = await this.reservationModel.countDocuments({
        user: userObjectId,
        reservationStatus: ReservationStatus.CONFIRMED,
      });

      const canceledCount = await this.reservationModel.countDocuments({
        user: userObjectId,
        reservationStatus: ReservationStatus.CANCELED,
      });

      return {
        total: totalCount,
        pending: pendingCount,
        confirmed: confirmedCount,
        canceled: canceledCount,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to get reservation statistics: ${error.message}`,
      );
    }
  }

  async getMentorServiceReservations(mentorId: string) {
    try {
      const mentorServices = await this.serviceModel
        .find({
          user: new Types.ObjectId(mentorId),
        })
        .lean()
        .exec();
      console.log(mentorServices);
      if (!mentorServices || mentorServices.length === 0) {
        return [];
      }

      const serviceIds = mentorServices.map((service) => service._id);

      const reservations = await this.reservationModel
        .find({
          service: { $in: serviceIds },
        })
        .populate('user', '_id fullName email')
        .populate('service', '_id name price description')
        .lean()
        .exec();

      return reservations.map((reservation) => ({
        ...reservation,
        _id: reservation._id.toString(),
        user: reservation.user
          ? {
              _id: reservation.user._id.toString(),
              fullName: (reservation.user as any).fullName,
              email: (reservation.user as any).email,
            }
          : null,
        service: reservation.service
          ? {
              _id: reservation.service._id.toString(),
              name: (reservation.service as any).name,
              price: (reservation.service as any).price,
              description: (reservation.service as any).description,
            }
          : null,
      }));
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve mentor service reservations: ${error.message}`,
      );
    }
  }
}
