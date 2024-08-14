import { ModelType } from '@prisma/db-api';
import { IsEnum, IsInt, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddInteriorModelDto {
  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  productId: number;

  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  x: number;

  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  y: number;

  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  z: number;

  @ApiProperty({ type: String })
  @IsString()
  @IsUrl()
  url: string;

  @ApiProperty({
    type: String,
    enum: ModelType,
    example: ModelType.FLOOR_ITEM,
  })
  @IsString()
  @IsEnum(ModelType)
  type: ModelType;
}
