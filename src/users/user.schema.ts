import { Exclude, Type } from 'class-transformer';
import { UserRole } from 'src/utils/enums';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Skill } from 'src/skills/skill.schema';
export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, maxlength: 150, required: false })
  username: string;
  @Prop({ type: String, maxlength: 150, required: true })
  fullName: string;
  @Prop({ type: String, maxlength: 250, required: true, unique: true })
  email: string;
  @Prop({ required: true })
  @Exclude()
  password: string;
  @Prop({ type: String, enum: UserRole, default: UserRole.NORMAL_USER })
  userRole: UserRole;
  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ type: String, default: null })
  profileImage: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
