import {
  MessageHandlerErrorBehavior,
  Nack,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ImageGenerateDto } from './dto/image-generate.dto';
import { ImageGenerateResponse } from './image-generate.interface';
import { TaskStatus } from '@prisma/db-api';
import { ApiDataService } from '@datn/prisma';
import { RabbitService } from '@datn/rabbitmq';
import { CreditService } from '../credit/credit.service';

@Injectable()
export class ImageGenerateService {
  private readonly logger = new Logger(ImageGenerateService.name);

  constructor(
    private readonly prisma: ApiDataService,
    private readonly rabbitService: RabbitService,
    private readonly creditService: CreditService,
  ) {}

  async generateInteriorImageTask(
    imageGenerateDto: ImageGenerateDto,
    image: Express.Multer.File,
  ) {
    try {
      await this.creditService.useCredit();

      this.logger.log('Send generate room image request to queue >>');

      const fileBase64 = image ? image.buffer.toString('base64') : null;

      const task = await this.prisma.task.create({
        data: {
          status: TaskStatus.QUEUE,
          workspaceId: imageGenerateDto.workspaceId,
          prompt: imageGenerateDto.prompt,
        },
      });

      const messageParams = {
        id: task.id,
        prompt: imageGenerateDto.prompt,
        workspace_id: imageGenerateDto.workspaceId,
        seed: imageGenerateDto.seed,
        num_inference_steps: imageGenerateDto.numInferenceSteps,
        guidance_scale: imageGenerateDto.guidanceScale,
        negative_prompt_2: imageGenerateDto.negativePrompt2,
        num_images_per_prompt: imageGenerateDto.numImagesPerPrompt,
      };

      if (!fileBase64) {
        await this.rabbitService.publish(
          'generate.image',
          'text',
          messageParams,
        );
      } else {
        await this.rabbitService.publish('generate.image', 'image', {
          ...messageParams,
          image: fileBase64,
        });
      }

      return task;
    } catch (err) {
      this.logger.log('Generate interior image request error. Refund credit');
      await this.creditService.refundCredit();
    }
  }

  @RabbitSubscribe({
    exchange: 'process.complete',
    routingKey: 'image',
    queue: 'process.complete',
    createQueueIfNotExists: true,
    errorBehavior: MessageHandlerErrorBehavior.ACK,
  })
  async updateInteriorGenerateTaskStatus(message: ImageGenerateResponse) {
    try {
      this.logger.log(`Received message process status of task ${message.id}`);

      switch (message.status) {
        case TaskStatus.PROMPT_NOT_INTERIOR:
        case TaskStatus.IMAGE_NOT_INTERIOR:
          this.logger.log(`Task ${message.id} is not interior`);
          await this.prisma.task.update({
            where: { id: message.id },
            data: {
              status: message.status,
              url: message.image_url,
            },
          });
          break;
        case TaskStatus.QUEUE:
          this.logger.log(`Task ${message.id} is queueing`);
          await this.prisma.task.update({
            where: { id: message.id },
            data: {
              status: message.status,
            },
          });
          break;
        default:
          this.logger.log(`Try to update status of task ${message.id}`);
          await this.prisma.task.update({
            where: { id: message.id },
            data: {
              status: message.status,
              url: message.image_url,
            },
          });
          break;
      }
    } catch (err) {
      this.logger.error(`Error when processing task ${message.id}` + err);
      if (message.id) {
        await this.prisma.task.update({
          where: { id: message.id },
          data: {
            status: TaskStatus.FAILED,
          },
        });
      }
      return new Nack(); // not requeue the message
    }
  }

  getTaskStatus(taskId: string) {
    return this.prisma.task.findUnique({
      where: { id: taskId },
    });
  }
}
