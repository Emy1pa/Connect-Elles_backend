import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Types } from 'mongoose';
export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  text: string;
}
