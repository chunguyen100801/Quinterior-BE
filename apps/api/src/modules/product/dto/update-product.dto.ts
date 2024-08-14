import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UpdateProductModelDto } from './update-product-model.dto';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['modelData']),
) {
  @ApiPropertyOptional({ type: UpdateProductModelDto })
  @IsOptional()
  @Type(() => UpdateProductModelDto)
  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  modelData: UpdateProductModelDto;
}
