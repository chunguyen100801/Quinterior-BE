import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import {
  ChatGptService,
  GeminiProService,
  GeminiProVisionService,
} from './providers';
import { AI_PROVIDERS } from './ai.constant';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [
    AIService,
    { provide: AI_PROVIDERS.GEMINI_PRO, useClass: GeminiProService },
    {
      provide: AI_PROVIDERS.GEMINI_PRO_VISION,
      useClass: GeminiProVisionService,
    },
    { provide: AI_PROVIDERS.CHATGPT, useClass: ChatGptService },
  ],
  exports: [AIService],
})
export class AIModule {}
