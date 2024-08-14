export interface IUploadedMulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface IApiFile {
  name: string;
  isArray?: boolean;
}
