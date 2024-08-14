import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @ApiProperty({ type: Number, example: 1 })
  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  @Type(() => Number)
  productId: number;

  @ApiProperty({ type: Number, example: 1 })
  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  @Type(() => Number)
  quantity: number;
}
