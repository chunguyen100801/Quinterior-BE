import {
  REDIS_PUBLISHER_CLIENT,
  REDIS_SUBSCRIBER_CLIENT,
} from './redis.constant';

import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

export type RedisClient = Redis;

export const RedisProviders: Provider[] = [
  {
    useFactory: (configService: ConfigService): RedisClient => {
      return new Redis(configService.getOrThrow<string>('redis.url'));
    },
    provide: REDIS_PUBLISHER_CLIENT,
    inject: [ConfigService],
  },
  {
    useFactory: (configService: ConfigService): RedisClient => {
      return new Redis(configService.getOrThrow<string>('redis.url'));
    },
    provide: REDIS_SUBSCRIBER_CLIENT,
    inject: [ConfigService],
  },
];
