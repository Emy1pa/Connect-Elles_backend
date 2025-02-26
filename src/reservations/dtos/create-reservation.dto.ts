import {
  IsDateString,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateReservationDto {
  @IsDateString()
  @IsNotEmpty()
  reservationDate: Date;

  @IsString()
  @IsNotEmpty()
  cardHolderName: string;

  @IsNumberString()
  @IsNotEmpty()
  @Length(13, 19)
  cardNumber: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: 'Card expiry must be in the format MM/YY',
  })
  cardExpiry: string;

  @IsNumberString()
  @IsNotEmpty()
  @Length(3, 4)
  cardCVV: string;
}
