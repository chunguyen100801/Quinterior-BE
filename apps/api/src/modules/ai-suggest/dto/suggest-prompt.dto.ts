import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SuggestPromptDto {
  @ApiProperty({ type: String, example: 'demo' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  prompt: string;
}
