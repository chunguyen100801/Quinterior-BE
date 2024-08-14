import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderItemModule } from '../order-item/order-item.module';
import { CartModule } from '../cart/cart.module';
import { ProductModule } from '../product/product.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    OrderItemModule,
    CartModule,
    ProductModule,
    PaymentModule,
    PaymentModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
