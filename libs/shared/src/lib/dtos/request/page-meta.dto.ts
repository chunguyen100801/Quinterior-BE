import { IsBoolean, IsNumber, IsPositive } from 'class-validator';
import { QueryOptionsDto } from './query-options.dto';
import { ApiProperty } from '@nestjs/swagger';

interface IPageMetaDtoParameters {
  pageOptionsDto: QueryOptionsDto;
  itemCount: number;
}

export class PageMetaDto {
  @ApiProperty({ type: Number, example: 1 })
  @IsNumber()
  @IsPositive()
  readonly page: number;

  @ApiProperty({ type: Number, example: 10 })
  @IsNumber()
  @IsPositive()
  readonly take: number;

  @ApiProperty({ type: Number, example: 100 })
  @IsNumber()
  @IsPositive()
  readonly itemCount: number;

  @ApiProperty({ type: Number, example: 10 })
  @IsNumber()
  @IsPositive()
  readonly pageCount: number;

  @ApiProperty({ type: Boolean, example: true })
  @IsBoolean()
  @IsPositive()
  readonly hasPreviousPage: boolean;

  @ApiProperty({ type: Boolean, example: true })
  @IsBoolean()
  readonly hasNextPage: boolean;

  constructor({ pageOptionsDto, itemCount }: IPageMetaDtoParameters) {
    this.page = pageOptionsDto.page;
    this.take = pageOptionsDto.take;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
