import { Cron, CronExpression } from '@nestjs/schedule';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { ApiDataService } from '@datn/prisma';
import { TaskStatus } from '@prisma/db-api';
import { ConfigService } from '@nestjs/config';
import { LockControl } from '../distributed-lock/distributed-lock.module';
import { LOCK_CONTROL } from '../distributed-lock/distributed-lock.enum';
import { DISTRIBUTED_LOCKS } from '../distributed-lock/distributed-lock.constant';
import dayjs from 'dayjs';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly prisma: ApiDataService,
    @Inject(LOCK_CONTROL.GET_LOCK)
    private readonly getLock: LockControl,
    @Inject(LOCK_CONTROL.RELEASE_LOCK)
    private readonly releaseLock: LockControl,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_10AM, {
    name: DISTRIBUTED_LOCKS.REMOVE_OLD_GENERATE_IMAGE_TASK,
  })
  async removeOldGenerateImageTasks(): Promise<void> {
    const lock = await this.getLock(
      DISTRIBUTED_LOCKS.REMOVE_OLD_GENERATE_IMAGE_TASK,
    );

    if (!lock) {
      this.logger.log('Lock is already acquired');
      return;
    }

    try {
      this.logger.log('Called every day at 10:00 AM');
      this.logger.log('Running remove failed generate image schedule job');

      const expirationDate = dayjs().subtract(1, 'day').toDate();

      await this.prisma.task.deleteMany({
        where: {
          status: TaskStatus.FAILED,
          createdAt: {
            lt: expirationDate,
          },
        },
      });
    } catch (error) {
      this.logger.error('Failed to remove old generate image tasks', error);
    } finally {
      this.logger.log('Removed old generate image tasks successfully');

      await this.releaseLock(DISTRIBUTED_LOCKS.REMOVE_OLD_GENERATE_IMAGE_TASK);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM, {
    name: DISTRIBUTED_LOCKS.REMOVE_EXPIRED_TOKENS,
  })
  async removeExpiredToken(): Promise<void> {
    const lock = await this.getLock(DISTRIBUTED_LOCKS.REMOVE_EXPIRED_TOKENS);

    if (!lock) {
      this.logger.log('Lock is already acquired');
      return;
    }

    try {
      this.logger.log('Called every day at 10:00 AM');
      this.logger.log('Running remove expired tokens schedule job');

      const tokenExpires = this.configService.getOrThrow<number>(
        'auth.refreshTokenExpires',
      );

      const expirationDate = dayjs().subtract(tokenExpires, 'second').toDate();

      await this.prisma.tokenKey.deleteMany({
        where: {
          createdAt: {
            lt: expirationDate,
          },
        },
      });
    } catch (error) {
      this.logger.error('Failed to remove expired tokens', error);
    } finally {
      this.logger.log('Removed expired tokens successfully');

      await this.releaseLock(DISTRIBUTED_LOCKS.REMOVE_EXPIRED_TOKENS);
    }
  }

  async disableScheduleTask() {
    await this.getLock(DISTRIBUTED_LOCKS.REMOVE_OLD_GENERATE_IMAGE_TASK);
    await this.getLock(DISTRIBUTED_LOCKS.REMOVE_EXPIRED_TOKENS);
  }
}
