import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class FavoriteDto {
  @IsNotEmpty()
  user: Types.ObjectId;

  @IsNotEmpty()
  blog: Types.ObjectId;
}
