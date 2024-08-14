import { QueryOptionsDto } from '@datn/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductsQueryOptionsDto extends QueryOptionsDto {
  @ApiPropertyOptional({ type: String, example: '1,2,3,4' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  categoryIds?: string;

  @ApiPropertyOptional({ type: String, example: 'gte:2,lte:10' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  price?: string;

  @ApiPropertyOptional({ type: String, example: 'gte:1,lte:5' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  rating?: string;

  @ApiPropertyOptional({ type: Number, example: 1 })
  @IsOptional()
  @IsPositive()
  @IsNumber()
  @Type(() => Number)
  sellerId?: number;
}
