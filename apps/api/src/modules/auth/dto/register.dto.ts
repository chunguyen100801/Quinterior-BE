import { IsPassword } from '@datn/shared';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ type: String, example: 'Nguyễn' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ type: String, example: 'Văn A' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ type: String, example: 'quanghuynh@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: String, example: 'password' })
  @IsPassword()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ type: String, example: '0796694097' })
  @IsPhoneNumber('VN')
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;
}
