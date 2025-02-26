import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ReservationStatus } from 'src/utils/enums';
export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ required: true })
  reservationDate: Date;

  @Prop({
    type: String,
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  userRole: ReservationStatus;

  @Prop({ required: true })
  cardHolderName: string;

  @Prop({ required: true })
  cardNumber: string;

  @Prop({ required: true })
  cardExpiry: string;

  @Prop({ required: true })
  cardCVV: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  service: Types.ObjectId;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
