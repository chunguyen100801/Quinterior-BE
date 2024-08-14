import { IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RandomSearchQueryDto {
  @ApiPropertyOptional({
    type: Number,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    type: Number,
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset?: number = 1;
}
