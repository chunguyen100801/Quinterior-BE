import { RedisModule, RedisServiceAbstract } from '@datn/redis';
import { Logger, Module } from '@nestjs/common';
import { LOCK_CONTROL } from './distributed-lock.enum';
import { DISTRIBUTED_LOCKS } from './distributed-lock.constant';

export type Locks = (typeof DISTRIBUTED_LOCKS)[keyof typeof DISTRIBUTED_LOCKS];

export type LockControl = (lock: Locks) => Promise<boolean>;

@Module({
  imports: [RedisModule],
  providers: [
    {
      provide: Logger,
      useValue: new Logger(DistributedLockModule.name),
    },
    {
      provide: LOCK_CONTROL.GET_LOCK,
      inject: [RedisServiceAbstract, Logger],
      useFactory: (redisService: RedisServiceAbstract, logger: Logger) => {
        return async (key: Locks): Promise<boolean> => {
          logger.debug(`Acquiring lock for ${key}`);
          const result = await redisService.setnx(key, false);
          return result === 1;
        };
      },
    },
    {
      provide: LOCK_CONTROL.RELEASE_LOCK,
      inject: [RedisServiceAbstract, Logger],
      useFactory: (redisService: RedisServiceAbstract, logger: Logger) => {
        return async (key: Locks): Promise<boolean> => {
          logger.debug(`Releasing lock for ${key}`);
          const result = await redisService.del(key);
          return result === 1;
        };
      },
    },
  ],
  exports: [LOCK_CONTROL.GET_LOCK, LOCK_CONTROL.RELEASE_LOCK],
})
export class DistributedLockModule {}
