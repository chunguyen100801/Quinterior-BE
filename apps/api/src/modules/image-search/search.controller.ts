import { UserRole } from '@prisma/db-api';
import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { RoomSearchDto } from './dto/image-from-url.dto';
import { ImageSearchService } from './search.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from '@datn/shared';
import { TitleSearchQueryDto } from './dto/title-search-query.dto';
import { ImageSearchQueryOptionsDto } from './dto/image-search-query-options.dto';
import { PromptSearchQueryDto } from './dto/prompt-search-query.dto';
import { InteriorCreateDto } from './dto/interior-create.dto';
import { RandomSearchQueryDto } from './dto/random-search-query.dto';
import { ROUTES } from '../../constants';

@ApiTags('Images search')
@Controller(ROUTES.IMAGES)
export class ImageSearchController {
  constructor(private readonly imageSearchService: ImageSearchService) {}

  @Auth([UserRole.ADMIN])
  @Post('room-class')
  async addRoomClass() {
    return this.imageSearchService.addRoomSchema();
  }

  @Auth([UserRole.ADMIN])
  @Post('interior-class')
  async addInteriorClass() {
    return this.imageSearchService.addInteriorSchema();
  }

  @Auth()
  @ApiBody({
    type: RoomSearchDto,
  })
  @Post('room')
  async newRoom(
    @Body()
    {
      image_url,
      prompt,
      workspaceId,
      seed,
      numInferenceSteps,
      guidanceScale,
      negativePrompt,
    }: RoomSearchDto,
  ) {
    return this.imageSearchService.newRoom(
      image_url,
      prompt,
      workspaceId,
      seed,
      numInferenceSteps,
      guidanceScale,
      negativePrompt,
    );
  }

  @Auth()
  @ApiBody({
    type: InteriorCreateDto,
  })
  @Post('interior')
  async newInterior(@Body() interiorCreateDto: InteriorCreateDto) {
    return this.imageSearchService.saveInteriorImageFromUrl(
      interiorCreateDto.urls,
      interiorCreateDto.model,
      interiorCreateDto.name,
      interiorCreateDto.productID,
    );
  }

  @Get('rooms/random-search')
  @HttpCode(200)
  async randomSearch(
    @Query(new ValidationPipe({ transform: true }))
    randomSearchQueryDto: RandomSearchQueryDto,
  ) {
    return this.imageSearchService.randomRoomSearch(randomSearchQueryDto);
  }

  @Get('rooms/rest-search')
  @HttpCode(200)
  async restSearch(
    @Query(new ValidationPipe({ transform: true }))
    randomSearchQueryDto: RandomSearchQueryDto,
  ) {
    return this.imageSearchService.searchRoomViaRestApi(randomSearchQueryDto);
  }

  @Post('rooms/image-search')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'The file to upload',
    type: 'object',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          nullable: false,
        },
        limit: {
          type: 'number',
          nullable: true,
        },
        offset: {
          type: 'number',
          nullable: true,
        },
        certainty: {
          type: 'number',
          nullable: true,
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async roomImageSearch(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
    @Body() imageSearchQueryDto: ImageSearchQueryOptionsDto,
  ) {
    return this.imageSearchService.roomImageSearch(
      file,
      imageSearchQueryDto.certainty,
      imageSearchQueryDto.limit,
      imageSearchQueryDto.offset,
    );
  }

  @Get('rooms/prompt-search')
  @HttpCode(200)
  async roomPromptSearch(
    @Query(new ValidationPipe({ transform: true }))
    promptSearchQueryDto: PromptSearchQueryDto,
  ) {
    return this.imageSearchService.roomPromptSearch(promptSearchQueryDto);
  }

  @Post('interiors/image-search')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'The file to upload',
    type: 'object',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          nullable: false,
        },
        limit: {
          type: 'number',
          nullable: true,
        },
        offset: {
          type: 'number',
          nullable: true,
        },
        certainty: {
          type: 'number',
          nullable: true,
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async interiorImageSearch(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
    @Body() imageSearchQueryDto: ImageSearchQueryOptionsDto,
  ) {
    return this.imageSearchService.interiorImageSearch(
      file,
      imageSearchQueryDto.certainty,
      imageSearchQueryDto.limit,
      imageSearchQueryDto.offset,
    );
  }

  @Get('interiors/title-search')
  @HttpCode(200)
  async interiorTitleSearch(
    @Query(new ValidationPipe({ transform: true }))
    titleSearchQueryDto: TitleSearchQueryDto,
  ) {
    return this.imageSearchService.interiorTitleSearch(titleSearchQueryDto);
  }
}
