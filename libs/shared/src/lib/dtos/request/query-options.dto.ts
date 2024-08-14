import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Order } from '../../@types';
import { Type } from 'class-transformer';

export class QueryOptionsDto {
  @ApiPropertyOptional({
    enum: Order,
    description: 'Sort order',
    default: Order.ASC,
  })
  @IsOptional()
  @IsEnum(Order)
  order: Order = Order.ASC;

  @ApiPropertyOptional({ minimum: 1, default: 1, description: 'Page number' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @IsInt()
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
    description: 'Number of results per page',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @IsInt()
  @Type(() => Number)
  take: number = 10;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
