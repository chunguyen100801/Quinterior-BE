import { Module } from '@nestjs/common';
import { WeaviateService } from './weaviate.service';
import { HttpService, HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [WeaviateService, HttpService],
  exports: [WeaviateService],
})
export class WeaviateModule {}
