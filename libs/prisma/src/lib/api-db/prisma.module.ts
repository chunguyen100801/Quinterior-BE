import { Global, Module } from '@nestjs/common';
import { ApiDataService } from './prisma.service';
import { PrismaOrmHealthIndicator } from './prisma.health';

@Global()
@Module({
  providers: [ApiDataService, PrismaOrmHealthIndicator],
  exports: [ApiDataService, PrismaOrmHealthIndicator],
})
export class ApiDataModule {}
