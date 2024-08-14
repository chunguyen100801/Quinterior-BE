import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { MailConfig } from './config.type';
import { registerAs } from '@nestjs/config';
import { validateConfig } from '../utils';

class EnvironmentVariablesValidator {
  @IsString()
  MAIL_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  MAIL_PORT: number;

  @IsString()
  MAIL_USERNAME: string;

  @IsString()
  MAIL_PASSWORD: string;

  @IsString()
  JWT_MAIL_SECRET: string;

  @IsNumber()
  @IsOptional()
  JWT_MAIL_TOKEN_TTL: number;
}

export default registerAs<MailConfig>('mail', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT, 10) : 345,
    username: process.env.MAIL_USERNAME,
    password: process.env.MAIL_PASSWORD,
    jwtMailSecret: process.env.JWT_MAIL_SECRET,
    jwtMailExpires: process.env.JWT_MAIL_TOKEN_TTL
      ? parseInt(process.env.JWT_MAIL_TOKEN_TTL, 10)
      : 259200,
  };
});
