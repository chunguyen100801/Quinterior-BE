import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { CreateProductModelDto } from './create-product-model.dto';

export class CreateProductDto {
  @ApiProperty({ type: String, example: 'demo' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ type: String, example: 'This is demo' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(10000)
  description: string;

  @ApiPropertyOptional({ type: String, example: '#f3f3f3' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  background: string;

  @ApiProperty({ type: Number, example: 1 })
  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ type: Number, example: 1 })
  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  price: number;

  @ApiProperty({ type: [Number], example: [1, 2] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @Transform(({ value }: { value: number[] | string }) => {
    return typeof value === 'string' ? value.split(',').map(Number) : value;
  })
  categoryIds: number[];

  @ApiPropertyOptional({ type: CreateProductModelDto })
  @IsOptional()
  @Type(() => CreateProductModelDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  modelData: CreateProductModelDto;
}
