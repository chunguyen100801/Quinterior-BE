import { S3Service, S3ServiceAbstract } from '@datn/s3';
import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageServiceAbstract } from './storage.abstract';
import { ApiDataService } from '@datn/prisma';

@Module({
  providers: [
    {
      provide: StorageServiceAbstract,
      useClass: StorageService,
    },
    {
      provide: S3ServiceAbstract,
      useClass: S3Service,
    },
    ApiDataService,
  ],
  exports: [
    {
      provide: StorageServiceAbstract,
      useClass: StorageService,
    },
  ],
})
export class StorageModule {}
