import { Injectable, Logger } from '@nestjs/common';
import weaviate, {
  WeaviateClient,
  WeaviateObject,
  WeaviateObjectsList,
} from 'weaviate-ts-client';
import {
  interior,
  interiorImage,
  interiorName,
  room,
  roomPrompt,
} from './schema';
import { ConfigService } from '@nestjs/config';

import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  InteriorImageSearchResult,
  InteriorTitleSearchResult,
  RoomImageSearchResult,
} from './weaviate.interface';

@Injectable()
export class WeaviateService {
  private logger = new Logger(WeaviateService.name);
  private client: WeaviateClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.client = weaviate.client({
      scheme: 'http',
      host: this.configService.getOrThrow<string>('weaviate.host'),
      // apiKey: new ApiKey(
      //   this.configService.getOrThrow<string>('weaviate.apiKey'),
      // ),
    });
  }

  public async addRoomSchema(): Promise<void> {
    await Promise.all([
      this.client.schema.classCreator().withClass(roomPrompt).do(),
      this.client.schema.classCreator().withClass(room).do(),
    ]);

    const roomReferenceProperty = {
      name: 'room',
      dataType: ['Room'],
    };

    await Promise.all([
      this.client.schema
        .propertyCreator()
        .withClassName('RoomPrompt')
        .withProperty(roomReferenceProperty)
        .do(),
    ]);
  }

  public async addInteriorSchema(): Promise<void> {
    await Promise.all([
      this.client.schema.classCreator().withClass(interiorImage).do(),
      this.client.schema.classCreator().withClass(interiorName).do(),
      this.client.schema.classCreator().withClass(interior).do(),
    ]);

    const interiorReferenceProperty = {
      name: 'interior',
      dataType: ['Interior'],
    };

    await Promise.all([
      this.client.schema
        .propertyCreator()
        .withClassName('InteriorImage')
        .withProperty(interiorReferenceProperty)
        .do(),
      this.client.schema
        .propertyCreator()
        .withClassName('InteriorName')
        .withProperty(interiorReferenceProperty)
        .do(),
    ]);
  }

  async saveNewRoom(
    imageUrl: string,
    prompt: string,
    workspaceId: number,
    seed: number,
    numInferenceSteps: number,
    guidanceScale: number,
    negativePrompt: string,
  ): Promise<WeaviateObject> {
    const room: WeaviateObject = await this.client.data
      .creator()
      .withClassName('Room')
      .do();

    this.logger.log('Create room successfully');

    const base64 = await this.fetchAndConvertImageToBase64(imageUrl);

    this.logger.log('Now creating RoomPrompt object...');

    const roomPrompt: WeaviateObject = await this.client.data
      .creator()
      .withClassName('RoomPrompt')
      .withProperties({
        prompt: prompt,
      })
      .do();

    this.logger.log('Now saving room object into roomPrompt...');

    if (roomPrompt.id) {
      await this.client.data
        .merger()
        .withClassName('RoomPrompt')
        .withId(roomPrompt.id)
        .withProperties({
          room: [{ beacon: `weaviate://localhost/Room/${room.id}` }],
        })
        .do();
    }

    this.logger.log('Now saving prompt and image into room object...');
    if (room.id) {
      await this.client.data
        .merger()
        .withClassName('Room')
        .withId(room.id)
        .withProperties({
          image: base64,
          image_url: imageUrl,
          roomPrompt: [
            { beacon: `weaviate://localhost/RoomPrompt/${roomPrompt.id}` },
          ],
          workspaceId: workspaceId,
          seed: seed,
          numInferenceSteps: numInferenceSteps,
          guidanceScale: guidanceScale,
          negativePrompt: negativePrompt,
        })
        .do();
    }

    this.logger.log('Now saving prompt into room object...');

    return room;
  }

  public async roomImageSearch(
    base64: string,
    certainty: number = 0.8,
    fields: string = '',
    limit: number = 2,
    offset: number = 0,
  ): Promise<RoomImageSearchResult[]> {
    const resImage = await this.client.graphql
      .get()
      .withClassName('Room')
      .withFields(
        `
				${fields}
        image_url
        workspaceId
        seed
        numInferenceSteps
        guidanceScale
        negativePrompt
        _additional {certainty}
        roomPrompt {
          ... on RoomPrompt {
            prompt
          }
        }
      `,
      )
      .withNearImage({
        image: base64,
        certainty,
      })
      .withLimit(limit)
      .withOffset(offset)
      .do();

    this.logger.log('Search results: ' + JSON.stringify(resImage));

    const results: RoomImageSearchResult[] = resImage.data.Get.Room.map(
      (imageData: any) => {
        const result: RoomImageSearchResult = {
          image_url: imageData.image_url,
          certainty: imageData._additional.certainty,
          prompt: imageData.roomPrompt[0].prompt,
          workspaceId: imageData.workspaceId,
          seed: imageData.seed,
          numInferenceSteps: imageData.numInferenceSteps,
          guidanceScale: imageData.guidanceScale,
          negativePrompt: imageData.negativePrompt,
        };

        return result;
      },
    );

    return results;
  }

  public async roomRandomSearch(
    limit: number = 10,
    offset: number = 0,
  ): Promise<RoomImageSearchResult[]> {
    const resImage = await this.client.graphql
      .get()
      .withClassName('Room')
      .withFields(
        `
        image_url
        workspaceId
        seed
        numInferenceSteps
        guidanceScale
        negativePrompt
        roomPrompt {
          ... on RoomPrompt {
            prompt
          }
        }
      `,
      )
      .withLimit(limit)
      .withOffset(offset)
      .do();

    this.logger.log('Search results: ' + JSON.stringify(resImage));

    const results: RoomImageSearchResult[] = resImage.data.Get.Room.map(
      (imageData: any) => {
        const result: RoomImageSearchResult = {
          image_url: imageData.image_url,
          workspaceId: imageData.workspaceId,
          certainty: 1,
          seed: imageData.seed,
          numInferenceSteps: imageData.numInferenceSteps,
          guidanceScale: imageData.guidanceScale,
          negativePrompt: imageData.negativePrompt,
          prompt:
            imageData.roomPrompt?.length > 0
              ? imageData.roomPrompt[0].prompt
              : null,
        };

        return result;
      },
    );

    return results;
  }

  public async searchRoomViaRestApi(limit: number = 10, offset: number = 0) {
    const resImage: WeaviateObjectsList = await this.client.data
      .getter()
      .withClassName('Room')
      .withLimit(limit)
      .do();

    this.logger.log(offset);

    this.logger.log('Search results: ' + JSON.stringify(resImage));

    // const results: RoomRandomSearchResult[] = resImage.data.Get.RoomImage.map((imageData: any) => {
    //   const result: RoomRandomSearchResult = {
    //     image_url: imageData.image_url,
    //   };

    //   // Check if the room property is present and not null
    //   if (imageData.room && Array.isArray(imageData.room)) {
    //     // Iterate over each room (should typically be only one)
    //     for (const room of imageData.room) {
    //       // Check if roomPrompt is an array and has elements
    //       if (room.roomPrompt && Array.isArray(room.roomPrompt) && room.roomPrompt.length > 0) {
    //         result.prompt = room.roomPrompt[0].prompt;
    //       }
    //       // Check if roomImages is an array and has elements
    //       if (room.roomImages && Array.isArray(room.roomImages) && room.roomImages.length > 0) {
    //         result.roomImages = room.roomImages.map((img: any) => img.image_url);
    //       }
    //     }
    //   }

    //   return result;
    // });

    return resImage;
  }

  public async roomSearchByWorkspaceId(
    workspaceId: number,
    limit: number = 2,
    offset: number = 0,
    order: string = 'asc',
  ): Promise<RoomImageSearchResult[]> {
    const resImage = await this.client.graphql
      .get()
      .withClassName('Room')
      .withFields(
        `
        image_url
        workspaceId
        seed
        numInferenceSteps
        guidanceScale
        negativePrompt
        roomPrompt {
          ... on RoomPrompt {
            prompt
          }
        }
      `,
      )
      .withLimit(limit)
      .withOffset(offset)
      .withWhere({
        operator: 'Equal',
        path: ['workspaceId'],
        valueInt: workspaceId,
      })
      .withSort([{ path: ['_creationTimeUnix'], order: order }])
      .do();

    this.logger.log('Search results: ');
    this.logger.log(resImage);

    const results: RoomImageSearchResult[] = resImage.data.Get.Room.map(
      (imageData: any) => {
        const result: RoomImageSearchResult = {
          image_url: imageData.image_url,
          workspaceId: imageData.workspaceId,
          certainty: 1,
          seed: imageData.seed,
          numInferenceSteps: imageData.numInferenceSteps,
          guidanceScale: imageData.guidanceScale,
          negativePrompt: imageData.negativePrompt,
          prompt:
            imageData.roomPrompt?.length > 0
              ? imageData.roomPrompt[0].prompt
              : null,
        };

        return result;
      },
    );

    this.logger.log('Get data successfully');

    return results;
  }

  public async roomPromptSearch(
    prompt: string,
    certainty: number = 0.8,
    fields: string = '',
    limit: number = 2,
    offset: number = 0,
  ): Promise<RoomImageSearchResult[]> {
    const resImage = await this.client.graphql
      .get()
      .withClassName('RoomPrompt')
      .withFields(
        ` ${fields}
        prompt
        _additional {certainty}
        room {
          ... on Room {
            image_url
            seed
            numInferenceSteps
            guidanceScale
            negativePrompt
          }
        }
      `,
      )
      .withNearText({
        concepts: [prompt],
        certainty: certainty,
      })
      .withLimit(limit)
      .withOffset(offset)
      .do();

    this.logger.log('Search results: ' + JSON.stringify(resImage));

    const results: RoomImageSearchResult[] = resImage.data.Get.RoomPrompt.map(
      (roomPromptData: any) => {
        return {
          prompt: roomPromptData.prompt,
          certainty: roomPromptData._additional.certainty,
          image_url: roomPromptData.room[0].image_url,
          seed: roomPromptData.room[0].seed,
          numInferenceSteps: roomPromptData.room[0].numInferenceSteps,
          guidanceScale: roomPromptData.room[0].guidanceScale,
          negativePrompt: roomPromptData.room[0].negativePrompt,
        };
      },
    );

    return results;
  }

  async saveNewInterior(
    imageUrls: string[],
    model: string,
    name: string,
    productID: number,
  ): Promise<WeaviateObject> {
    const interior = await this.client.data
      .creator()
      .withClassName('Interior')
      .withProperties({
        productID: productID,
        model: model,
      })
      .do();

    this.logger.log('Create interior successfully');

    const interiorImageIds = [];
    for (const imageUrl of imageUrls) {
      const base64 = await this.fetchAndConvertImageToBase64(imageUrl);
      const interiorImage = await this.client.data
        .creator()
        .withClassName('InteriorImage')
        .withProperties({
          image: base64,
          image_url: imageUrl,
          interior: [
            { beacon: `weaviate://localhost/Interior/${interior.id}` },
          ],
        })
        .do();
      if (interiorImage?.id) interiorImageIds.push(interiorImage.id);
    }

    this.logger.log('Get interiorImageIds successfully');

    const interiorName = await this.client.data
      .creator()
      .withClassName('InteriorName')
      .withProperties({
        name: name,
        interior: [{ beacon: `weaviate://localhost/Interior/${interior.id}` }],
      })
      .do();

    this.logger.log('Get interior Name successfully');

    await Promise.all(
      interiorImageIds.map((id: string) =>
        this.client.data
          .merger()
          .withClassName('InteriorImage')
          .withId(id)
          .withProperties({
            interior: [
              { beacon: `weaviate://localhost/Interior/${interior.id}` },
            ],
          })
          .do(),
      ),
    );

    this.logger.log('Merge list interior successfully');

    if (interior.id) {
      await this.client.data
        .merger()
        .withClassName('Interior')
        .withId(interior.id)
        .withProperties({
          interiorImages: interiorImageIds.map((id) => ({
            beacon: `weaviate://localhost/InteriorImage/${id}`,
          })),
          interiorPrompt: [
            { beacon: `weaviate://localhost/InteriorName/${interiorName.id}` },
          ],
        })
        .do();
    }

    return interior;
  }

  public async interiorImageSearch(
    base64: string,
    certainty: number = 0.8,
    fields: string = '',
    limit: number = 2,
    offset: number = 0,
  ): Promise<InteriorImageSearchResult[]> {
    const resImage = await this.client.graphql
      .get()
      .withClassName('InteriorImage')
      .withFields(
        `
				${fields}
        image_url
        _additional {certainty}
        interior {
          ... on Interior {
            model
            productID
            interiorName {
              ... on InteriorName {
                name
              }
            }
            interiorImages {
              ... on InteriorImage {
                image_url
              }
            }
          }
        }
      `,
      )
      .withNearImage({
        image: base64,
        certainty: certainty,
      })
      .withLimit(limit)
      .withOffset(offset)
      .do();

    this.logger.log('Search results: ' + JSON.stringify(resImage));

    const results: InteriorImageSearchResult[] =
      resImage.data.Get.InteriorImage.map((imageData: any) => {
        const result: InteriorImageSearchResult = {
          image_url: imageData.image_url,
          model: imageData.interior[0].model,
          certainty: imageData._additional.certainty,
        };

        if (imageData.interior && Array.isArray(imageData.interior)) {
          for (const interior of imageData.interior) {
            if (
              interior.interiorName &&
              Array.isArray(interior.interiorName) &&
              interior.interiorName.length > 0
            ) {
              result.name = interior.interiorName[0].name;
            }

            if (
              interior.interiorImages &&
              Array.isArray(interior.interiorImages) &&
              interior.interiorImages.length > 0
            ) {
              result.interiorImages = interior.interiorImages.map(
                (img: any) => img.image_url,
              );
            }

            if (interior.productID) {
              result.productID = interior.productID;
            }
          }
        }

        return result;
      });

    return results;
  }

  public async interiorTitleSearch(
    title: string,
    certainty: number = 0.8,
    fields: string = '',
    limit: number = 2,
    offset: number = 0,
  ): Promise<InteriorTitleSearchResult[]> {
    const resImage = await this.client.graphql
      .get()
      .withClassName('InteriorName')
      .withFields(
        `
				${fields}
        name
        _additional {certainty}
        interior {
          ... on Interior {
            model
            interiorImages {
              ... on InteriorImage {
                image_url
              }
            }
            interiorName {
              ... on InteriorName {
                name
              }
            }
          }
        }
      `,
      )
      .withNearText({
        concepts: [title],
        certainty,
      })
      .withLimit(limit)
      .withOffset(offset)
      .do();

    this.logger.log('Search results: ' + JSON.stringify(resImage));

    const results: InteriorTitleSearchResult[] =
      resImage.data.Get.InteriorName.map((interiorNameObj: any) => {
        const result: InteriorTitleSearchResult = {
          name: interiorNameObj.name,
          model: interiorNameObj.interior[0].model,
          image_urls: [],
          certainty: interiorNameObj._additional.certainty,
        };

        if (interiorNameObj.interior && interiorNameObj.interior.length > 0) {
          const interiorObj = interiorNameObj.interior[0];

          if (
            interiorObj.interiorImages &&
            Array.isArray(interiorObj.interiorImages)
          ) {
            result.image_urls = interiorObj.interiorImages.map(
              (img: any) => img.image_url,
            );
          }
        }

        return result;
      });

    return results;
  }

  async deleteRoom(url: string) {
    try {
      const resImage = await this.client.graphql
        .get()
        .withClassName('Room')
        .withFields(
          `
        _additional { id }
        image_url
        workspaceId
        roomPrompt {
          ... on RoomPrompt {
            prompt
          }
        }
      `,
        )
        .withWhere({
          operator: 'Equal',
          path: ['image_url'],
          valueString: url,
        })
        .do();

      if (resImage.data.Get.Room?.length > 0) {
        const id = resImage.data.Get.Room[0]._additional.id;
        this.logger.log('Delete object id ' + id);
        await this.client.data.deleter().withClassName('Room').withId(id).do();

        this.logger.log('Delete object by url successfully');
      }
    } catch (err) {
      this.logger.error('Delete object by url err', err);
    }
  }

  private async fetchAndConvertImageToBase64(
    imageUrl: string,
  ): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(imageUrl, { responseType: 'arraybuffer' }),
      );

      const imageBuffer = Buffer.from(response.data, 'binary');
      const base64Image = imageBuffer.toString('base64');
      this.logger.log('Image fetched successfully!');

      return base64Image;
    } catch (error) {
      this.logger.error(`Error fetching image: ${error}`);
      throw error;
    }
  }
}
