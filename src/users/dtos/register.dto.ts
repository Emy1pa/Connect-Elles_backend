import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  username?: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  fullName: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  @MinLength(8)
  password: string;
  @IsOptional()
  @IsString()
  profileImage?: string;
}
