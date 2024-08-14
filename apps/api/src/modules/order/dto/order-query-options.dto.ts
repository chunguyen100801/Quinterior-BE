import { QueryOptionsDto } from '@datn/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsOptional } from 'class-validator';
import { OrderStatus } from '@prisma/db-api';
import { Transform, Type } from 'class-transformer';

export class OrderQueryOptionsDto extends QueryOptionsDto {
  @ApiPropertyOptional({
    type: String,
    enum: OrderStatus,
    example: OrderStatus.CANCELED,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({
    type: Number,
    example: 1,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  customerId: number;

  @ApiPropertyOptional({
    type: Number,
    example: 1,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  sellerId: number;

  @ApiPropertyOptional({
    type: Date,
    example: '2021-01-01',
  })
  @Transform(({ value }) => (value ? new Date(value) : value))
  @IsOptional()
  @IsDate()
  startDate: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2021-01-01',
  })
  @Transform(({ value }) => (value ? new Date(value) : value))
  @IsDate()
  @IsOptional()
  endDate: Date;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
