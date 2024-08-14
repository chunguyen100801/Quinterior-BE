import { HttpException } from '@nestjs/common';

export class TokenInvalidException extends HttpException {
  constructor(message: string) {
    super(message, 498);
  }
}
