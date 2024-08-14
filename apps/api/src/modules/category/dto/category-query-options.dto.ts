import { QueryOptionsDto } from '@datn/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryQueryOptionsDto extends QueryOptionsDto {
  @ApiPropertyOptional({ type: Number, example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sellerId: number;
}
