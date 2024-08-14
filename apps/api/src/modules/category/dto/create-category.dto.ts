import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiPropertyOptional({ type: Number, example: 1 })
  @IsOptional()
  @IsPositive()
  @IsNumber()
  @Type(() => Number)
  parentId: number;

  @ApiProperty({ type: String, example: 'demo' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ type: String, example: 'his is demo' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(1000)
  description: string;
}
