import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ROUTES } from '../../constants';
import { AiSuggestService } from './ai-suggest.service';
import { SuggestPromptDto } from './dto/suggest-prompt.dto';
import { ResponseSuccessDto } from '@datn/shared';

@ApiTags('AI suggests')
@Controller(ROUTES.AI_SUGGESTS)
export class AiSuggestController {
  constructor(private readonly aiSuggestService: AiSuggestService) {}

  @Post('prompt')
  async suggestPrompt(@Body() suggestPromptDto: SuggestPromptDto) {
    const data = await this.aiSuggestService.suggestPrompt(suggestPromptDto);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get suggest positive and negative prompt of generate room image successfully',
      data,
    );
  }
}
