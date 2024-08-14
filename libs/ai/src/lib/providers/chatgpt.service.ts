import { Injectable, Logger } from '@nestjs/common';
import { AIServiceInterface } from '../ai.interface';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class ChatGptService implements AIServiceInterface {
  private readonly logger = new Logger(ChatGptService.name);
  private client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY'),
    });
  }

  async generateText(prompt: string): Promise<string> {
    this.logger.log(prompt);

    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
    };

    const chatCompletion: OpenAI.Chat.ChatCompletion =
      await this.client.chat.completions.create(params);

    this.logger.log(chatCompletion);

    return chatCompletion.choices[0].message.content || '';
  }
}
