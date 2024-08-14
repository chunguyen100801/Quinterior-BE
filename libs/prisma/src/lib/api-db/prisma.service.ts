import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/db-api';
import { PRISMA_CLIENT_OPTIONS } from './prisma.config';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@datn/shared';

@Injectable()
export class ApiDataService
  extends PrismaClient<Prisma.PrismaClientOptions, 'error' | 'query'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(ApiDataService.name);

  constructor(private readonly configService: ConfigService) {
    super({ ...PRISMA_CLIENT_OPTIONS });

    this.$on('query', (e: Prisma.QueryEvent) => {
      if (this.configService.get('app.nodeEnv') === Environment.DEVELOPMENT) {
        this.logger.debug('Query: ' + e.query);
        this.logger.debug('Params: ' + e.params);
        this.logger.debug('Duration: ' + e.duration + 'ms');
      }
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.$extends({
      result: {
        user: {
          fullName: {
            needs: { firstName: true, lastName: true },
            compute(user) {
              return `${user.firstName} ${user.lastName}`;
            },
          },
        },
      },
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
