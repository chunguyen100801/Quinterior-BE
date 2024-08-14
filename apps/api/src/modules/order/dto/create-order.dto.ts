import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from '../../order-item/dto/create-order-item.dto';
import { PaymentType } from '@prisma/db-api';

export class CreateOrderDto {
  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  products: CreateOrderItemDto[];

  @ApiProperty({
    type: String,
    enum: PaymentType,
    example: PaymentType.TRANSFER,
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiProperty({ type: Number, example: 1 })
  @IsNotEmpty()
  @IsInt()
  addressId: number;

  @ApiPropertyOptional({ type: String, example: 'This is note' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note: string;
}
