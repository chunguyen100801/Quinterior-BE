import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ type: String, example: '123 Main St, Springfield, IL 62701' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(256)
  address: string;

  @ApiProperty({ type: String, example: 'demo@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, example: '0796694097' })
  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phone: string;

  @ApiProperty({ type: String, example: 'Nguyen Văn A' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  fullName: string;

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsBoolean()
  @IsOptional()
  isDefault: boolean;
}
