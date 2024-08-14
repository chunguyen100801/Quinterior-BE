import { Controller, Get } from '@nestjs/common';
import { RedisOptions, Transport } from '@nestjs/microservices';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';

import { PrismaOrmHealthIndicator } from '@datn/prisma';
import { ConfigService } from '@nestjs/config';
import { ROUTES } from '../../constants';

@Controller(ROUTES.HEALTH)
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly health: HealthCheckService,
    private readonly ormIndicator: PrismaOrmHealthIndicator,
    private readonly microservice: MicroserviceHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.ormIndicator.pingCheck('database'),
      async () =>
        this.microservice.pingCheck<RedisOptions>('redis', {
          transport: Transport.REDIS,
          options: {
            db: this.configService.getOrThrow('redis.dbThrottler'),
            host: this.configService.getOrThrow('redis.host'),
            port: this.configService.getOrThrow('redis.port'),
            password: this.configService.getOrThrow('redis.password'),
          },
        }),
      async () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      async () => this.memory.checkRSS('memory_rss', 3000 * 1024 * 1024),
    ]);
  }
}
