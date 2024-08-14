import { IsString } from 'class-validator';

import { AwsConfig } from './config.type';
import { registerAs } from '@nestjs/config';
import { validateConfig } from '../utils';

class EnvironmentVariablesValidator {
  @IsString()
  AWS_ACCESS_KEY_ID: string;

  @IsString()
  AWS_SECRET_ACCESS_KEY: string;

  @IsString()
  AWS_PUBLIC_BUCKET_KEY: string;

  @IsString()
  AWS_CLOUDFRONT_URL: string;

  @IsString()
  AWS_REGION: string;
}

export default registerAs<AwsConfig>('aws', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    awsAccessKeyID: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsPublicBucketsKey: process.env.AWS_PUBLIC_BUCKET_KEY,
    awsCloudfrontURL: process.env.AWS_CLOUDFRONT_URL,
    awsRegion: process.env.AWS_REGION,
  };
});
