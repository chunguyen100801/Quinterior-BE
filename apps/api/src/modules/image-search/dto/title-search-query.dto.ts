import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class TitleSearchQueryDto {
  @ApiProperty({
    type: String,
    description: 'The title to search',
  })
  @IsNotEmpty()
  @IsString()
  title!: string;

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
}
