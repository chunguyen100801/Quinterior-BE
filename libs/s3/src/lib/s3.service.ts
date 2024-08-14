import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { S3ServiceAbstract } from './s3.abstract';
import { Upload } from '@aws-sdk/lib-storage';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import multer from 'multer';
import { UploadParams } from './s3.interface';

@Injectable()
export class S3Service implements S3ServiceAbstract {
  private logger = new Logger(S3Service.name);
  private readonly _s3Client: S3Client;
  private readonly bucketName: string;
  private readonly cloudFrontURL: string;

  constructor(private readonly configService: ConfigService) {
    this._s3Client = new S3Client({
      region: this.configService.getOrThrow<string>('aws.awsRegion'),
      credentials: {
        accessKeyId:
          this.configService.getOrThrow<string>('aws.awsAccessKeyID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'aws.awsSecretAccessKey',
        ),
      },
    });

    this.bucketName = this.configService.getOrThrow<string>(
      'aws.awsPublicBucketsKey',
    );

    this.cloudFrontURL = this.configService.getOrThrow<string>(
      'aws.awsCloudfrontURL',
    );
  }

  async uploadPrivateFile(params: UploadParams): Promise<string | null> {
    return this.uploadFile(params, true);
  }

  async uploadPublicFile(params: UploadParams): Promise<string | null> {
    return this.uploadFile(params, false);
  }

  async multipartUploadFile(params: UploadParams): Promise<string | null> {
    const { file, key, path, fileType } = params;
    if (!file) {
      return null;
    }

    const finalKey = path ? `${path}/${key}` : key;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: finalKey,
      Body: file.buffer,
      ContentType: fileType,
    };

    const parallelUpload = new Upload({
      client: this._s3Client,
      params: uploadParams,
      queueSize: 4,
      partSize: 1024 * 1024 * 5,
      leavePartsOnError: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parallelUpload.on('httpUploadProgress', (progress: any) => {
      this.logger.log(`Upload progress: ${JSON.stringify(progress)}`);
    });

    await parallelUpload.done();

    return `${this.cloudFrontURL}${finalKey}`;
  }

  async deleteFile(key: string): Promise<void> {
    const deleteParams = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      await this._s3Client.send(new DeleteObjectCommand(deleteParams));
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async uploadFile(
    params: UploadParams,
    isPrivate: boolean,
  ): Promise<string | null> {
    const { file, key, path, fileType } = params;
    if (!file) {
      return null;
    }

    const finalKey = path ? `${path}/${key}` : key;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: finalKey,
      Body: file.buffer,
      ContentType: fileType,
    };

    await this._s3Client.send(new PutObjectCommand(uploadParams));

    if (isPrivate) {
      return `${this.cloudFrontURL}${finalKey}`;
    } else {
      return `https://${this.bucketName}.s3.amazonaws.com/${finalKey}`;
    }
  }
}
