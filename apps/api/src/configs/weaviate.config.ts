import { IsString } from 'class-validator';

import { WeaviateConfig } from './config.type';
import { registerAs } from '@nestjs/config';
import { validateConfig } from '../utils';

class EnvironmentVariablesValidator {
  @IsString()
  WEAVIATE_HOST: string;

  @IsString()
  WEAVIATE_API_KEY: string;
}

export default registerAs<WeaviateConfig>('weaviate', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    host: process.env.WEAVIATE_HOST || 'http://localhost:8080',
    apiKey: process.env.WEAVIATE_API_KEY,
  };
});
