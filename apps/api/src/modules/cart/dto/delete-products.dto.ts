import { ArrayMinSize, IsArray, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DeleteProductsDto {
  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  @ArrayMinSize(1)
  @IsArray()
  @IsPositive({ each: true })
  @IsNumber({}, { each: true })
  @Type(() => Number)
  productIds: number[];
}
