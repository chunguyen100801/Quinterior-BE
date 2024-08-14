import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ImageGenerateDto {
  @ApiProperty({
    type: String,
    description: 'The prompt to generate the image',
  })
  @MinLength(1)
  @IsNotEmpty()
  @IsString()
  prompt!: string;

  @ApiPropertyOptional({
    type: Number,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  workspaceId?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'The number of seed',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  seed?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 50,
    description: 'The number of inference steps to take',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  numInferenceSteps?: number = 50;

  @ApiPropertyOptional({
    type: Number,
    example: 7,
    description: 'The number of guidance scale',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  guidanceScale?: number = 7;

  @ApiPropertyOptional({
    type: String,
    description: 'The negative prompt 2 to generate the image',
  })
  @MinLength(1)
  @IsOptional()
  @IsString()
  negativePrompt2?: string = null;

  @ApiPropertyOptional({
    type: Number,
    example: 1,
    description: 'The number of guidance scale',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  numImagesPerPrompt?: number = 1;
}
