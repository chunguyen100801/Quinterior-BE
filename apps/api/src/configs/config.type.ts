export type AppConfig = {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  apiVersion: string;
  appURL: string;
  frontendURL: string;
  documentEnabled: boolean;
};

export type AuthConfig = {
  accessTokenExpires: number;
  refreshTokenExpires: number;
  jwtForgotPasswordSecret: string;
  jwtForgotPasswordExpires: number;
  facebookClientID: string;
  facebookClientSecret: string;
  facebookCallbackURL: string;
  googleClientID: string;
  googleClientSecret: string;
  googleCallbackURL: string;
};

export type DatabaseConfig = {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  name?: string;
  username?: string;
};

export type RedisConfig = {
  url: string;
  host: string;
  port: number;
  username: string;
  password: string;
  dbCache: number;
  dbBullQueue: number;
  dbThrottler: number;
};

export type AwsConfig = {
  awsAccessKeyID: string;
  awsSecretAccessKey: string;
  awsPublicBucketsKey: string;
  awsCloudfrontURL: string;
  awsRegion: string;
};

export type MailConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  jwtMailSecret: string;
  jwtMailExpires: number;
};

export type ThrottlerConfig = {
  ttl: number;
  limit: number;
  loginFailLimit: number;
  loginFailTTL: number;
};

export type LanguageConfig = {
  availableLanguage: string[];
  defaultLanguage: string;
};

export type RabbitConfig = {
  uri: string;
};

export type WeaviateConfig = {
  host: string;
  apiKey: string;
};

export type PaymentConfig = {
  vnpVersion: string;
  vnpHashSecret: string;
  vnpTmnCode: string;
  vnpUrl: string;
  vnpReturnUrl: string;
  vnpLocale: string;
  vnpCurrCode: string;
};

export type GeminiConfig = {
  apiKey: string;
};
