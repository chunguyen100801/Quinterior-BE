export interface UploadParams {
  key: string;
  file: Express.Multer.File;
  path?: string;
  fileType: string;
}
