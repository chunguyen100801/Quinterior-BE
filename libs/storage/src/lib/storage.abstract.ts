import { StorageParam } from './storage.interface';
import { File } from '@prisma/db-api';

export abstract class StorageServiceAbstract {
  abstract createFile(
    userId: number,
    params: StorageParam,
  ): Promise<string | null>;

  abstract deleteFile(key: string): Promise<void>;

  abstract updateFile(key: string, data: Partial<File>): Promise<void>;
}
