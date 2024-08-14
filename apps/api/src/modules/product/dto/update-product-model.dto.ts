import { PartialType } from '@nestjs/swagger';
import { CreateProductModelDto } from './create-product-model.dto';

export class UpdateProductModelDto extends PartialType(CreateProductModelDto) {}
