import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [ProductModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
