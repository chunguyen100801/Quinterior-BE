import { IsPassword } from '@datn/shared';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthCredentialsDto {
  @ApiProperty({ type: String, example: 'quanghuynh@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ type: String, example: 'password' })
  @IsPassword()
  @IsNotEmpty()
  password!: string;
}
