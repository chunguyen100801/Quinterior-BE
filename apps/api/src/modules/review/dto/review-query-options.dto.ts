import { QueryOptionsDto } from '@datn/shared';
import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ReviewQueryOptionsDto extends OmitType(QueryOptionsDto, [
  'search',
]) {
  @ApiPropertyOptional({ type: Number, example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  productId?: number;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
