import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Name should be at least 3 characters long' })
  @MaxLength(100, { message: 'Name should not exceed 100 characters' })
  title: string;
  @IsString()
  @IsOptional()
  @MaxLength(250, { message: 'Description should not exceed 500 characters' })
  description?: string;
}
