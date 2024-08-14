import { IsPassword } from '@datn/shared';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, UserRole } from '@prisma/db-api';

export class CreateUserDto {
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

  @ApiPropertyOptional({ type: String, enum: Gender, example: Gender.FEMALE })
  @IsOptional()
  @IsString()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ type: String, enum: UserRole, example: UserRole.USER })
  @IsOptional()
  @IsString()
  @IsEnum(UserRole)
  role?: UserRole;
}
