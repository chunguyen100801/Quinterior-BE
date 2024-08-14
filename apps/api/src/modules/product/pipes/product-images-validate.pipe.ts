import { Express } from 'express';
import {
  ArgumentMetadata,
  BadRequestException,
  FileTypeValidator,
  Injectable,
  MaxFileSizeValidator,
  PipeTransform,
} from '@nestjs/common';
import { ProductImagesValidatePipeOptions } from '../product.interface';

@Injectable()
export class ProductImagesValidatePipe implements PipeTransform {
  constructor(private options: ProductImagesValidatePipeOptions) {}

  transform(
    fileRequest: {
      thumbnail: Express.Multer.File[];
      images: Express.Multer.File[];
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: ArgumentMetadata,
  ) {
    const fileTypeValidator = new FileTypeValidator({
      fileType: /(jpg|jpeg|png|webp)$/,
    });

    const fileSizeValidator = new MaxFileSizeValidator({
      maxSize: 1024 * 1024 * 10,
    });

    if (
      (!this.options.thumbnailRequired ||
        (fileRequest.thumbnail?.length === 1 &&
          fileTypeValidator.isValid(fileRequest.thumbnail[0]) &&
          fileSizeValidator.isValid(fileRequest.thumbnail[0]))) &&
      (!this.options.imagesRequired ||
        (fileRequest.images?.length > 0 &&
          fileRequest.images.every(
            (image) =>
              fileTypeValidator.isValid(image) &&
              fileSizeValidator.isValid(image),
          )))
    ) {
      return fileRequest;
    }

    throw new BadRequestException(
      'Invalid file type, file size or file is required',
    );
  }
}
