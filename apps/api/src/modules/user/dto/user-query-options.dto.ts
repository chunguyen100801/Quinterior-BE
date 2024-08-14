import { QueryOptionsDto } from '@datn/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UsersQueryOptionsDto extends QueryOptionsDto {
  @ApiPropertyOptional({ type: Boolean, example: 1 })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isDeleted?: boolean;
}
