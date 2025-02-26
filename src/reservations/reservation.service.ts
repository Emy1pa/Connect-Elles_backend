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
import { ReservationStatus } from 'src/utils/enums';

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
      const populatedReservation = await this.reservationModel
        .findById(newReservation._id)
        .populate('user', '_id fullName email')
        .populate('service', '_id name price description')
        .lean()
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
        .populate('service', '_id name price description')
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
              description: (reservation.service as any).description,
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
}
