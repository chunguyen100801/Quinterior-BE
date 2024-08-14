import { IsNotEmpty, IsString } from 'class-validator';

import { GeminiConfig } from './config.type';
import { registerAs } from '@nestjs/config';
import { validateConfig } from '../utils';

class EnvironmentVariablesValidator {
  @IsNotEmpty()
  @IsString()
  GEMINI_API_KEY: string;
}

export default registerAs<GeminiConfig>('gemini', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    apiKey: process.env.GEMINI_API_KEY,
  };
});
