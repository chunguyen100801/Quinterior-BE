import { QueryOptionsDto } from '@datn/shared';
import { OmitType } from '@nestjs/swagger';

export class NotificationQueryOptionsDto extends OmitType(QueryOptionsDto, [
  'search',
] as const) {
  get skip() {
    return (this.page - 1) * this.take;
  }
}
