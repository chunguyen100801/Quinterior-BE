import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class RoomSearchDto {
  @ApiProperty({ type: String })
  @IsString()
  @Type(() => String)
  image_url: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty({ type: Number })
  @IsInt()
  @IsNotEmpty()
  workspaceId: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  seed: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  numInferenceSteps: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  guidanceScale: number;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  negativePrompt: string;
}
