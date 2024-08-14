import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';

import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RegisterDto } from '../../auth/dto/register.dto';
import { Gender } from '@prisma/db-api';

export class UpdateUserDto extends PartialType(
  OmitType(RegisterDto, ['email', 'password']),
) {
  @IsOptional()
  firstName: string;

  @IsOptional()
  lastName: string;

  @IsOptional()
  phoneNumber: string;

  @ApiPropertyOptional({ type: String, enum: Gender, example: Gender.FEMALE })
  @IsOptional()
  @IsString()
  @IsEnum(Gender)
  gender: Gender;
}
