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
}
