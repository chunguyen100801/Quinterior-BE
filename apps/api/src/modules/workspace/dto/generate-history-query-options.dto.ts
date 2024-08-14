import { OmitType } from '@nestjs/swagger';
import { QueryOptionsDto } from '@datn/shared';

export class GenerateHistoryQueryOptionsDto extends OmitType(QueryOptionsDto, [
  'search',
] as const) {
  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
