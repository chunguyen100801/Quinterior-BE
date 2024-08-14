import { UploadParams } from './s3.interface';

export abstract class S3ServiceAbstract {
  abstract uploadPrivateFile(params: UploadParams): Promise<string | null>;

  abstract uploadPublicFile(params: UploadParams): Promise<string | null>;

  abstract multipartUploadFile(params: UploadParams): Promise<string | null>;

  abstract deleteFile(key: string): Promise<void>;
}
