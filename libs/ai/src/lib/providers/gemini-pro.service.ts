import { Injectable, Logger } from '@nestjs/common';
import { AIServiceInterface } from '../ai.interface';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { GENERATION_CONFIG, SAFETY_SETTINGS } from '../ai.constant';

@Injectable()
export class GeminiProService implements AIServiceInterface {
  private logger = new Logger(GeminiProService.name);
  private model: GenerativeModel;

  constructor(private readonly configService: ConfigService) {
    const genAI = new GoogleGenerativeAI(
      this.configService.getOrThrow('gemini.apiKey'),
    );
    this.model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig: GENERATION_CONFIG,
      safetySettings: SAFETY_SETTINGS,
    });
  }

  async generateText(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt);
    const response = result.response;

    this.logger.log(response.text());

    return response.text();
  }
}
