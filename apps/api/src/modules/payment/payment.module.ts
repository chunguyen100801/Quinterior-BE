import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ProductModule } from '../product/product.module';
import { SellerModule } from '../seller/seller.module';

@Module({
  imports: [ProductModule, SellerModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
