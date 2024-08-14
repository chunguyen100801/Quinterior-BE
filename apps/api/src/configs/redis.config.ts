import { IsInt, IsString, Max, Min, ValidateIf } from 'class-validator';

import { RedisConfig } from './config.type';
import { registerAs } from '@nestjs/config';
import { validateConfig } from '../utils';

class EnvironmentVariablesValidator {
  @ValidateIf((envValues) => envValues.REDIS_URL)
  @IsString()
  REDIS_URL: string;

  @ValidateIf((envValues) => !envValues.REDIS_URL)
  @IsString()
  REDIS_HOST: string;

  @ValidateIf((envValues) => !envValues.REDIS_URL)
  @IsInt()
  @Min(0)
  @Max(65535)
  REDIS_PORT: number;

  @ValidateIf((envValues) => !envValues.REDIS_URL)
  @IsString()
  REDIS_USERNAME: string;

  @ValidateIf((envValues) => !envValues.REDIS_URL)
  @IsString()
  REDIS_PASSWORD: string;

  @ValidateIf((envValues) => !envValues.REDIS_URL)
  @IsInt()
  @Min(1)
  REDIS_DB_CACHE: number;

  @ValidateIf((envValues) => !envValues.REDIS_URL)
  @IsInt()
  @Min(1)
  REDIS_DB_BULL_QUEUE: number;

  @ValidateIf((envValues) => !envValues.REDIS_URL)
  @IsInt()
  @Min(1)
  REDIS_DB_THROTTLER: number;
}

export default registerAs<RedisConfig>('redis', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    dbCache: parseInt(process.env.REDIS_DB_CACHE, 10),
    dbBullQueue: parseInt(process.env.REDIS_DB_BULL_QUEUE, 10),
    dbThrottler: parseInt(process.env.REDIS_DB_THROTTLER, 10),
  };
});
