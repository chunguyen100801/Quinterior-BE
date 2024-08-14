import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AIService } from '@datn/ai';
import { SuggestPromptDto } from './dto/suggest-prompt.dto';

class PromptResponseDto {
  positivePrompts: string[];
  negativePrompt: string;
}

@Injectable()
export class AiSuggestService {
  private logger = new Logger(AiSuggestService.name);

  constructor(private readonly aiService: AIService) {}

  async suggestPrompt(
    suggestPromptDto: SuggestPromptDto,
  ): Promise<PromptResponseDto> {
    const inputPrompt = this.createInputPrompt(suggestPromptDto);

    try {
      const response = await this.aiService.getResponse(inputPrompt);

      return this.extractPrompts(response);
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException('Suggest prompt failed');
    }
  }

  private createInputPrompt(suggestPromptDto: SuggestPromptDto): string {
    return `
## Important instruction:
You will be a prompt engineer to Create positive prompts, and negative prompts for stable diffusion model to generate images of interior design. it is crucial to satisfy this outline of a positive prompt to make the model generate the best image, write the prompt as a paragraph with no line break.
Topic: The main subject of the picture, the most accurate description of the imagery and intention in your mind. A good topic keyword will provide a good start for the following steps.
Camera Angle: Keywords defining the angle of view on the subject, reflecting our intentions.
Medium: Keywords related to the tools, materials, and methods used to create the artwork (digital, oil, watercolor, photograph, etc.).
Style: The artistic style of the picture (contemporary, surreal, abstract, cyberpunk, etc.).
Artist: The style of a particular artist.
Focus: Keywords that supplement the detail level of the image.
Lighting: Keywords that perfect the lighting of the image.
Refined Details: Keywords that add other details to complete the picture.

input:
a simple positive prompt from a user, and I want you to enhance it to make it follow the outline but don't change the context of the original positive prompt

output  :
5 prompt which is 5 paragraphs of positive prompt with no additional comments, just the prompt
1 prompt of negative prompt, only 1 negative prompt

The output must follow this json format:
{
  "positive_prompts": [
    {
      "prompt": "text of the positive prompt 1"
    },
    {
      "prompt": "text of the positive prompt 2"
    },
    {
      "prompt": "text of the positive prompt 3"
    },
    {
      "prompt": "text of the positive prompt 4"
    },
    {
      "prompt": "text of the positive prompt 5"
    }
  ],
  "negative_prompt": {
    "prompt": "text of the negative prompt"
  }
}

##Example:
User's Simple Positive Prompt: A bathroom with luxurious style.
Enhanced Positive Prompts:
1. A bathroom with luxurious style, featuring a spacious layout with a freestanding marble bathtub as the centerpiece. The camera angle is from a corner perspective, capturing the entire room with an emphasis on the bathtub. The medium is a high-resolution digital rendering, ensuring a photorealistic finish. The style is modern luxury, with elegant touches such as gold fixtures, a crystal chandelier, and a large vanity mirror. Inspired by the opulent designs of Philippe Starck, the bathroom showcases a seamless blend of functionality and high-end aesthetics. The focus is on intricate details like the veining in the marble, the texture of the plush towels, and the shine of the polished gold accents. Soft, ambient lighting enhances the luxurious atmosphere, with natural light streaming through a large window. Refined details include a glass-enclosed shower, a chic vanity area with premium toiletries, and lush green plants that add a touch of nature to the sophisticated space.
2. ...
3. ...
4. ...
5. ...
Negative Prompt:
Avoid cramped spaces, dim lighting, cheap or outdated materials, cluttered layouts, low-resolution images, unrealistic color schemes, overly ornate or gaudy elements, and anything that detracts from the luxurious and sophisticated aesthetic.
"

##Your input: ${suggestPromptDto.prompt}
    `;
  }

  private extractPrompts(input: string): PromptResponseDto {
    // Parse the JSON string into a JavaScript object
    const jsonData = JSON.parse(input);

    // Extract positive prompts
    const positivePrompts = jsonData.positive_prompts
      .map((prompt) => prompt.prompt)
      .slice(0, 2); // Return only the first 2 prompts

    // Extract negative prompt
    const negativePrompt = jsonData.negative_prompt.prompt;

    // Return the populated PromptResponseDto object
    return { positivePrompts, negativePrompt };
  }
}
