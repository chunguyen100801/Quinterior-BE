import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SuggestNegativePromptDto {
  @ApiProperty({ type: String, example: 'demo' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  prompt: string;
}
