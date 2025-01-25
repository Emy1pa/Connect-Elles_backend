import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(250)
  email: string;
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
