import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { S3ServiceAbstract } from './s3.abstract';

@Module({
  providers: [
    {
      provide: S3ServiceAbstract,
      useClass: S3Service,
    },
  ],
  exports: [
    {
      provide: S3ServiceAbstract,
      useClass: S3Service,
    },
  ],
})
export class StorageModule {}
