import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { HealthIndicator } from '@nestjs/terminus';
import { ApiDataService } from './prisma.service';

@Injectable()
export class PrismaOrmHealthIndicator extends HealthIndicator {
  constructor(private readonly prismaService: ApiDataService) {
    super();
  }

  async pingCheck(databaseName: string) {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return this.getStatus(databaseName, true);
    } catch (e: any) {
      throw new InternalServerErrorException('Prisma check failed', e);
    }
  }
}
