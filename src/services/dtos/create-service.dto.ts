import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ServiceStatus } from 'src/utils/enums';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsString()
  @IsOptional()
  serviceImage?: string;
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  duration: number;
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  price: number;
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  numberOfPlaces: number;
  @IsOptional()
  status?: ServiceStatus;
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;
}
