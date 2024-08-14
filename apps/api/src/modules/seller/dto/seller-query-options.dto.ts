import { OmitType } from '@nestjs/swagger';
import { QueryOptionsDto } from '@datn/shared';

export class SellerQueryOptionsDto extends OmitType(QueryOptionsDto, [
  'search',
]) {
  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
