import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplyReviewDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  reply: string;
}
