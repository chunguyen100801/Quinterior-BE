import { IsNumber, IsString } from 'class-validator';

import { AuthConfig } from './config.type';
import { registerAs } from '@nestjs/config';
import { validateConfig } from '../utils';

class EnvironmentVariablesValidator {
  @IsNumber()
  JWT_ACCESS_TOKEN_TTL: number;

  @IsNumber()
  JWT_REFRESH_TOKEN_TTL: number;

  @IsString()
  JWT_FORGOT_PASSWORD_SECRET: string;

  @IsNumber()
  JWT_FORGOT_PASSWORD_TOKEN_TTL: number;

  @IsString()
  FACEBOOK_CLIENT_ID: string;

  @IsString()
  FACEBOOK_CLIENT_SECRET: string;

  @IsString()
  FACEBOOK_CALLBACK_URL: string;

  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsString()
  GOOGLE_CALLBACK_URL: string;
}

export default registerAs<AuthConfig>('auth', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    refreshTokenExpires: process.env.JWT_REFRESH_TOKEN_TTL
      ? parseInt(process.env.JWT_REFRESH_TOKEN_TTL, 10)
      : 1800,
    accessTokenExpires: process.env.JWT_ACCESS_TOKEN_TTL
      ? parseInt(process.env.JWT_ACCESS_TOKEN_TTL, 10)
      : 2592000,
    jwtForgotPasswordSecret: process.env.JWT_FORGOT_PASSWORD_SECRET,
    jwtForgotPasswordExpires: process.env.JWT_FORGOT_PASSWORD_TOKEN_TTL
      ? parseInt(process.env.JWT_FORGOT_PASSWORD_TOKEN_TTL, 10)
      : 259200,
    facebookClientID: process.env.FACEBOOK_CLIENT_ID,
    facebookClientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    facebookCallbackURL: process.env.FACEBOOK_CALLBACK_URL,
    googleClientID: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleCallbackURL: process.env.GOOGLE_CALLBACK_URL,
  };
});
