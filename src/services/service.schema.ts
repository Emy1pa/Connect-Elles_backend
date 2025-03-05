import { Category } from 'src/categories/category.schema';
import { User } from 'src/users/user.schema';
import { ServiceStatus } from 'src/utils/enums';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type ServiceDocument = Service & Document;

@Schema({ timestamps: true })
export class Service {
  @Prop({ type: String, required: true })
  title: string;
  @Prop({ type: String, required: true })
  description: string;
  @Prop({
    type: String,
    enum: ServiceStatus,
    default: ServiceStatus.AVAILABLE,
    required: true,
  })
  status: ServiceStatus;
  @Prop({ type: String, required: false, default: null })
  serviceImage?: string;
  @Prop({ type: Number, required: true })
  duration: number;
  @Prop({
    type: Number,
    required: true,
    get: (value: number) => value.toFixed(2),
    set: (value: number) => parseFloat(value.toFixed(2)),
  })
  price: number;
  @Prop({ type: Number, required: true, minlength: 1 })
  numberOfPlaces: number;
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: Types.ObjectId | User;

  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  category: Types.ObjectId | Category;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
