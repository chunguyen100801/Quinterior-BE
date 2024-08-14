import { IsNumber, IsOptional, IsPositive } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddProductDto {
  @ApiPropertyOptional({ type: Number, example: 1 })
  @IsOptional()
  @IsPositive()
  @IsNumber()
  @Type(() => Number)
  productId: number;

  @ApiPropertyOptional({ type: Number, example: 1 })
  @IsOptional()
  @IsPositive()
  @IsNumber()
  @Type(() => Number)
  quantity: number;
}
