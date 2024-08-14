import { Module } from '@nestjs/common';
import { ImageSearchController } from './search.controller';
import { ImageSearchService } from './search.service';
import { WeaviateService } from '@datn/weaviate';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ImageSearchController],
  providers: [ImageSearchService, WeaviateService],
})
export class SearchModule {}
