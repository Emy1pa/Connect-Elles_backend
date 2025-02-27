import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
export type CommentDocument = Comment & Document;
@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true, minlength: 1 })
  text: string;
  @Prop({ type: Types.ObjectId, ref: 'Blog', required: true })
  blog: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;
  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);
