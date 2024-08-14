import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerifyEmailDto {
  @ApiProperty({ type: String, example: 'quanghuynh@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
