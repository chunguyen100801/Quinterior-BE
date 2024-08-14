import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ModelType } from '@prisma/db-api';

export class CreateProductModelDto {
  @IsInt()
  @IsNotEmpty()
  x: number;

  @IsInt()
  @IsNotEmpty()
  y: number;

  @IsInt()
  @IsNotEmpty()
  z: number;

  @IsEnum(ModelType)
  @IsNotEmpty()
  @IsString()
  type: ModelType;
}
