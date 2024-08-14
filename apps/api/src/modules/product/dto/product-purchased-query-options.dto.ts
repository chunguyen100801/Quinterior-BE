import { QueryOptionsDto } from '@datn/shared';

export class ProductPurchasedQueryOptionsDto extends QueryOptionsDto {
  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
