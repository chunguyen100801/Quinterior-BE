import { v4 } from 'uuid';
import { S3ServiceAbstract } from '@datn/s3';
import { TransactionHost } from '@nestjs-cls/transactional';
import { Injectable, Logger } from '@nestjs/common';

import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { StorageServiceAbstract } from './storage.abstract';
import { ApiDataService } from '@datn/prisma';
import { StorageParam } from './storage.interface';
import { lookup } from 'mime-types';

@Injectable()
export class StorageService implements StorageServiceAbstract {
  private logger = new Logger(StorageService.name);

  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<ApiDataService>
    >,
    private readonly s3Service: S3ServiceAbstract,
  ) {}

  async createFile(
    userId: number,
    { path, file }: StorageParam,
  ): Promise<string | null> {
    const key = v4();

    this.logger.log(file.mimetype);

    const fileType =
      file.mimetype == 'application/octet-stream'
        ? String(lookup(file.originalname))
        : file.mimetype;

    this.logger.log(fileType);

    const url = await this.s3Service.uploadPublicFile({
      file: file,
      key: key,
      path: path,
      fileType: fileType,
    });

    this.logger.log('create file');

    await this.txHost.tx.file.create({
      data: {
        path: path,
        key: key,
        size: file.size,
        type: fileType,
        creatorId: userId,
      },
    });

    return url;
  }

  async deleteFile(key: string): Promise<void> {
    this.logger.log('Delete file in db and s3');
    const file = await this.txHost.tx.file.findUnique({
      where: {
        key,
      },
    });

    if (!file) {
      return;
    }

    await this.txHost.tx.file.delete({
      where: {
        key,
      },
    });

    const finalKey = file.path ? `${file.path}/${key}` : key;

    await this.s3Service.deleteFile(finalKey);
  }

  async updateFile(key: string, data: Partial<File>): Promise<void> {
    this.logger.log('Update file data in db');

    await this.txHost.tx.file.update({
      where: {
        key: key,
      },
      data: data,
    });
  }
}
