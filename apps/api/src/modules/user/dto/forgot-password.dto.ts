import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ type: String, example: 'quanghuynh@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
