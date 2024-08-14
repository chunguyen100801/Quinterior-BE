import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class ResponseSuccessDto<T> {
  @ApiProperty({ type: Number })
  statusCode: HttpStatus;

  @ApiProperty({ type: String })
  message: string;

  @ApiProperty()
  data: T = null;

  constructor(statusCode: HttpStatus, message: string, data?: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
