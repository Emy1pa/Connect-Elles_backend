import { User } from 'src/users/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Type } from 'class-transformer';
export type SkillDocument = Skill & Document;

@Schema({ timestamps: true })
export class Skill {
  @Prop({ type: String, required: true, maxlength: 100 })
  title: string;
  @Prop({ type: String, required: false })
  description: string;

  @Type(() => User)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | User;
}
export const SkillSchema = SchemaFactory.createForClass(Skill);
