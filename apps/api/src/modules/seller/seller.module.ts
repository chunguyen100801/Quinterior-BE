import { Module } from '@nestjs/common';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { StorageModule } from '@datn/s3';
import { StorageServiceAbstract, StorageService } from '@datn/storage';

@Module({
  imports: [StorageModule],
  controllers: [SellerController],
  providers: [
    SellerService,
    {
      provide: StorageServiceAbstract,
      useClass: StorageService,
    },
  ],
  exports: [SellerService],
})
export class SellerModule {}
