import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SearchType } from '../search.enum';

export class PromptSearchQueryDto {
  @ApiProperty({
    type: String,
    description: 'The prompt',
  })
  @IsNotEmpty()
  @IsString()
  prompt!: string;

  @ApiPropertyOptional({
    type: Number,
    example: 0.8,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  certainty?: number = 0.8;

  @ApiPropertyOptional({
    type: Number,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    type: Number,
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset?: number = 1;

  @ApiPropertyOptional({
    type: String,
    enum: SearchType,
    example: SearchType.ROOM,
  })
  @IsOptional()
  @IsString()
  @IsEnum(SearchType)
  search_type?: SearchType = SearchType.ROOM;
}
