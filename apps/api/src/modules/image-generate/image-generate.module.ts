import { Module } from '@nestjs/common';
import { ImageGenerateController } from './image-generate.controller';
import { ImageGenerateService } from './image-generate.service';
import { CreditService } from '../credit/credit.service';

@Module({
  imports: [],
  controllers: [ImageGenerateController],
  providers: [ImageGenerateService, CreditService],
})
export class ImageGenerateModule {}
