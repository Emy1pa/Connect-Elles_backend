import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
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
  @MaxLength(150)
  fullName: string;
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(250)
  email: string;
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
