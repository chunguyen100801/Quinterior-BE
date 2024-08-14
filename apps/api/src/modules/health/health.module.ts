import { HealthController } from './health.controller';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaOrmHealthIndicator } from '@datn/prisma';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PrismaOrmHealthIndicator],
})
export class HealthModule {}
