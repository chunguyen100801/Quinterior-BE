import { Injectable } from '@nestjs/common';
import {
  AIServiceInterface,
  GENERATION_CONFIG,
  SAFETY_SETTINGS,
} from '@datn/ai';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiProVisionService implements AIServiceInterface {
  private model: GenerativeModel;

  constructor(private readonly configService: ConfigService) {
    const genAI = new GoogleGenerativeAI(
      this.configService.getOrThrow('gemini.apiKey'),
    );
    this.model = genAI.getGenerativeModel({
      model: 'gemini-pro-vision',
      generationConfig: GENERATION_CONFIG,
      safetySettings: SAFETY_SETTINGS,
    });
  }

  async generateText(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt);
    const response = result.response;
    return response.text();
  }
}
