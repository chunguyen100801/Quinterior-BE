import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  comment: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  creatorId: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  orderItemId: number;
}
