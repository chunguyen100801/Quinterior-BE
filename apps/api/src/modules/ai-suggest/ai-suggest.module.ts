import { Module } from '@nestjs/common';
import { AiSuggestController } from './ai-suggest.controller';
import { AiSuggestService } from './ai-suggest.service';
import { AIModule } from '@datn/ai';

@Module({
  imports: [AIModule],
  controllers: [AiSuggestController],
  providers: [AiSuggestService],
})
export class AiSuggestModule {}
