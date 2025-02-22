import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { BlogStatus } from 'src/utils/enums';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  title: string;
  @IsString()
  @IsNotEmpty()
  content: string;
  @IsString()
  @IsOptional()
  blogImage?: string;
  @IsString()
  @IsNotEmpty()
  summary: string;
  @IsOptional()
  status?: BlogStatus;
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;
}
