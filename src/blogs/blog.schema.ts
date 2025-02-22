import { Category } from 'src/categories/category.schema';
import { User } from 'src/users/user.schema';
import { BlogStatus } from 'src/utils/enums';
import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BlogDocument = Blog & Document;

@Schema({ timestamps: true })
export class Blog {
  @Prop({ type: String, required: true, maxlength: 250 })
  title: string;
  @Prop({ type: String, required: true })
  content: string;
  @Prop({
    type: String,
    enum: BlogStatus,
    default: BlogStatus.DRAFT,
    required: true,
  })
  status: BlogStatus;
  @Prop({ type: String, required: false, default: null })
  blogImage?: string;
  @Prop({ type: String, required: true })
  summary: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;
}
export const BlogSchema = SchemaFactory.createForClass(Blog);
