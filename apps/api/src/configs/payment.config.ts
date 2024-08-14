import { IsString } from 'class-validator';

import { PaymentConfig } from './config.type';
import { registerAs } from '@nestjs/config';
import { validateConfig } from '../utils';

class EnvironmentVariablesValidator {
  @IsString()
  VNP_VERSION: string;

  @IsString()
  VNP_HASHSECRET: string;

  @IsString()
  VNP_TMNCODE: string;

  @IsString()
  VNP_URL: string;

  @IsString()
  VNP_RETURNURL: string;

  @IsString()
  VNP_LOCALE: string;

  @IsString()
  VNP_CURRCODE: string;
}

export default registerAs<PaymentConfig>('payment', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    vnpVersion: process.env.VNP_VERSION,
    vnpHashSecret: process.env.VNP_HASHSECRET,
    vnpTmnCode: process.env.VNP_TMNCODE,
    vnpUrl: process.env.VNP_URL,
    vnpReturnUrl: process.env.VNP_RETURNURL,
    vnpLocale: process.env.VNP_LOCALE,
    vnpCurrCode: process.env.VNP_CURRCODE,
  };
});
