import { Module } from '@nestjs/common';
import { RedisProviders } from './redis.provider';
import { RedisService } from './redis.service';
import { RedisServiceAbstract } from './redis.abstract';

@Module({
  providers: [
    ...RedisProviders,
    {
      provide: RedisServiceAbstract,
      useClass: RedisService,
    },
  ],
  exports: [
    {
      provide: RedisServiceAbstract,
      useClass: RedisService,
    },
  ],
})
export class RedisModule {}
