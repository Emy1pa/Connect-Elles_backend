import { Transform } from 'class-transformer';
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
  @Transform(({ value }) => Number(value))
  duration: number;
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Min(0)
  @Transform(({ value }) => Number(value))
  price: number;
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Transform(({ value }) => Number(value))
  numberOfPlaces: number;
  @IsOptional()
  status?: ServiceStatus;
  @IsNotEmpty()
  categoryId: string;
}
