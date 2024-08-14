import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImageGenerateService } from './image-generate.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageGenerateDto } from './dto/image-generate.dto';
import { ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { Auth, ResponseSuccessDto } from '@datn/shared';
import { ROUTES } from '../../constants';

@ApiTags('Images generate')
@Controller(ROUTES.IMAGES_GENERATE)
export class ImageGenerateController {
  constructor(private readonly imageGenerateService: ImageGenerateService) {}

  @Auth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          nullable: false,
        },
        workspaceId: {
          type: 'number',
          nullable: true,
        },
        image: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
        seed: {
          type: 'number',
          nullable: true,
        },
        numInferenceSteps: {
          type: 'number',
          example: 50,
          nullable: true,
        },
        numImagesPerPrompt: {
          type: 'number',
          example: 7,
          nullable: true,
        },
        guidanceScale: {
          type: 'number',
          example: 1,
          nullable: true,
        },
        negativePrompt2: {
          type: 'string',
          nullable: true,
        },
      },
      required: ['prompt'],
    },
  })
  @ApiConsumes('multipart/form-data')
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async generateInteriorImageTask(
    @Body() imageGenerateDto: ImageGenerateDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    image: Express.Multer.File,
  ) {
    const data = await this.imageGenerateService.generateInteriorImageTask(
      imageGenerateDto,
      image,
    );

    return new ResponseSuccessDto(
      HttpStatus.ACCEPTED,
      'Add generate room image task successfully',
      data,
    );
  }

  @Auth()
  @Get(':taskId')
  @ApiParam({
    name: 'taskId',
    type: 'string',
    required: true,
  })
  @HttpCode(200)
  async getTaskStatus(@Param('taskId') taskId: string) {
    const task = await this.imageGenerateService.getTaskStatus(taskId);

    return new ResponseSuccessDto(
      HttpStatus.OK,
      'Get task status successfully',
      task,
    );
  }
}
