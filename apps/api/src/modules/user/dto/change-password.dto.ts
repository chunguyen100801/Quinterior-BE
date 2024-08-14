import { IsPassword } from '@datn/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ type: String, example: 'password' })
  @IsNotEmpty()
  @IsPassword()
  @MinLength(6)
  @MaxLength(20)
  oldPassword: string;

  @ApiProperty({ type: String, example: 'newpassword' })
  @IsNotEmpty()
  @IsPassword()
  @MinLength(6)
  @MaxLength(20)
  newPassword: string;

  @ApiProperty({ type: String, example: 'newpassword' })
  @IsNotEmpty()
  @IsPassword()
  @MinLength(6)
  @MaxLength(20)
  confirmPassword: string;
}
