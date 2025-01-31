import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Title should be at least 3 characters long' })
  @MaxLength(100, { message: 'Title should not exceed 100 characters' })
  title: string;
}
