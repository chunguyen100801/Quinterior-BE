import { WeaviateService } from '@datn/weaviate';
import { Injectable, Logger } from '@nestjs/common';
import { TitleSearchQueryDto } from './dto/title-search-query.dto';
import { PromptSearchQueryDto } from './dto/prompt-search-query.dto';
import { RandomSearchQueryDto } from './dto/random-search-query.dto';

@Injectable()
export class ImageSearchService {
  private readonly logger = new Logger(ImageSearchService.name);

  constructor(private readonly weaviateService: WeaviateService) {}

  async addRoomSchema() {
    return this.weaviateService.addRoomSchema();
  }

  async addInteriorSchema() {
    return this.weaviateService.addInteriorSchema();
  }

  // Room
  async newRoom(
    image_url: string,
    prompt: string,
    workspaceId: number,
    seed: number,
    numInferenceSteps: number,
    guidanceScale: number,
    negativePrompt: string,
  ) {
    return this.weaviateService.saveNewRoom(
      image_url,
      prompt,
      workspaceId,
      seed,
      numInferenceSteps,
      guidanceScale,
      negativePrompt,
    );
  }

  async roomImageSearch(
    file: Express.Multer.File,
    certainty: number,
    limit: number,
    offset: number,
  ) {
    this.logger.log('encode file to base64');
    const fileBase64 = file.buffer.toString('base64');
    return this.weaviateService.roomImageSearch(
      fileBase64,
      certainty,
      '',
      limit,
      offset,
    );
  }

  async roomPromptSearch({
    prompt,
    certainty,
    limit,
    offset,
  }: PromptSearchQueryDto) {
    this.logger.log('encode file to base64');
    return this.weaviateService.roomPromptSearch(
      prompt,
      certainty,
      '',
      limit,
      offset,
    );
  }

  async randomRoomSearch({ limit, offset }: RandomSearchQueryDto) {
    this.logger.log('encode file to base64');
    return this.weaviateService.roomRandomSearch(Number(limit), Number(offset));
  }

  async searchRoomViaRestApi({ limit, offset }: RandomSearchQueryDto) {
    this.logger.log('encode file to base64');
    return this.weaviateService.searchRoomViaRestApi(
      Number(limit),
      Number(offset),
    );
  }

  // Interior
  async saveInteriorImageFromUrl(
    image_urls: string[],
    model: string,
    name: string,
    productID: number,
  ) {
    return this.weaviateService.saveNewInterior(
      image_urls,
      model,
      name,
      productID,
    );
  }

  async interiorImageSearch(
    file: Express.Multer.File,
    certainty: number,
    limit: number,
    offset: number,
  ) {
    this.logger.log('encode file to base64');
    const fileBase64 = file.buffer.toString('base64');
    return this.weaviateService.interiorImageSearch(
      fileBase64,
      certainty,
      '',
      limit,
      offset,
    );
  }

  async interiorTitleSearch({
    title,
    certainty,
    limit,
    offset,
  }: TitleSearchQueryDto) {
    this.logger.log('encode file to base64');
    return this.weaviateService.interiorTitleSearch(
      title,
      certainty,
      '',
      limit,
      offset,
    );
  }
}
