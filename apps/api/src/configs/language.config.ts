import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGE } from '@datn/shared';
import { IsOptional, IsString } from 'class-validator';

import { registerAs } from '@nestjs/config';
import { LanguageConfig } from './config.type';
import { validateConfig } from '../utils';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  DEFAULT_LANGUAGE: string;
}

export default registerAs<LanguageConfig>('language', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    availableLanguage: SUPPORTED_LANGUAGE,
    defaultLanguage: process.env.DEFAULT_LANGUAGE ?? DEFAULT_LANGUAGE,
  };
});
