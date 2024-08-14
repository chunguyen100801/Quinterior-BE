import { Inject, Injectable } from '@nestjs/common';
import { AIServiceInterface } from './ai.interface';
import { AI_PROVIDERS } from './ai.constant';

@Injectable()
export class AIService {
  private aiProvider: AIServiceInterface;

  constructor(
    @Inject(AI_PROVIDERS.GEMINI_PRO)
    private geminiProService: AIServiceInterface,
    @Inject(AI_PROVIDERS.GEMINI_PRO_VISION)
    private geminiProVisionService: AIServiceInterface,
    @Inject(AI_PROVIDERS.CHATGPT) private chatGptService: AIServiceInterface,
  ) {
    this.aiProvider = this.chatGptService;
  }

  switchProvider(provider: 'gemini-pro' | 'gemini-pro-vision' | 'chatgpt') {
    switch (provider) {
      case 'chatgpt':
        this.aiProvider = this.chatGptService;
        break;
      case 'gemini-pro':
        this.aiProvider = this.geminiProService;
        break;
      case 'gemini-pro-vision':
        this.aiProvider = this.geminiProVisionService;
        break;
    }
  }

  async getResponse(prompt: string): Promise<string> {
    return this.aiProvider.generateText(prompt);
  }
}
