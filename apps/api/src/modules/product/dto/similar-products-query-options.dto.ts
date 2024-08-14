import { QueryOptionsDto } from '@datn/shared';
import { OmitType } from '@nestjs/swagger';

export class SimilarProductsQueryOptionsDto extends OmitType(QueryOptionsDto, [
  'search',
]) {
  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
