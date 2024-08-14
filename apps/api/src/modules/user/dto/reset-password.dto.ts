import { IsPassword } from '@datn/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ type: String })
  @IsPassword()
  @IsNotEmpty()
  password: string;
}
