import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { SellerModule } from '../seller/seller.module';
import { StorageModule } from '@datn/s3';
import { StorageService, StorageServiceAbstract } from '@datn/storage';
import { WeaviateService } from '@datn/weaviate';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [SellerModule, StorageModule, HttpModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    {
      provide: StorageServiceAbstract,
      useClass: StorageService,
    },
    WeaviateService,
  ],
  exports: [ProductService],
})
export class ProductModule {}
