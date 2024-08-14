import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ImageUrlAndPromptDto {
  @ApiProperty({ type: String })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  model: string;
}
