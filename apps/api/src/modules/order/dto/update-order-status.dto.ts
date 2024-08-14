import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { OrderStatus } from '@prisma/db-api';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @ApiProperty({
    type: String,
    enum: OrderStatus,
    example: OrderStatus.PROCESSING,
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
