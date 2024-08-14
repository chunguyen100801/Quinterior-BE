import { IsString } from 'class-validator';

import { registerAs } from '@nestjs/config';
import { validateConfig } from '../utils';
import { RabbitConfig } from './config.type';

class EnvironmentVariablesValidator {
  @IsString()
  RABBIT_URI: string;
}

export default registerAs<RabbitConfig>('rabbit', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    uri: process.env.RABBIT_URI,
  };
});
