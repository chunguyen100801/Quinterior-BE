import { IsInt, IsOptional } from 'class-validator';

import { ThrottlerConfig } from './config.type';
import { registerAs } from '@nestjs/config';
import { validateConfig } from '../utils';

class EnvironmentVariablesValidator {
  @IsInt()
  @IsOptional()
  THROTTLER_TTL: number;

  @IsInt()
  @IsOptional()
  THROTTLER_LIMIT: number;

  @IsInt()
  @IsOptional()
  LOGIN_FAIL_LIMIT: number;

  @IsInt()
  @IsOptional()
  LOGIN_FAIL_TTL: number;
}

export default registerAs<ThrottlerConfig>('throttler', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    ttl: process.env.THROTTLER_TTL
      ? parseInt(process.env.THROTTLER_TTL, 10)
      : 60,
    limit: process.env.THROTTLER_LIMIT
      ? parseInt(process.env.THROTTLER_LIMIT, 10)
      : 100,
    loginFailLimit: process.env.LOGIN_FAIL_LIMIT
      ? parseInt(process.env.LOGIN_FAIL_LIMIT, 10)
      : 5,
    loginFailTTL: process.env.LOGIN_FAIL_TTL
      ? parseInt(process.env.LOGIN_FAIL_TTL, 10)
      : 20 * 60 * 1000,
  };
});
