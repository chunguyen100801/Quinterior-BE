import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type ValidationError } from 'class-validator';
import { type Response } from 'express';

@Catch(UnprocessableEntityException)
export class HttpExceptionFilter
  implements ExceptionFilter<UnprocessableEntityException>
{
  constructor(public reflector: Reflector) {}

  catch(exception: UnprocessableEntityException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();
    const r = exception.getResponse() as { message: ValidationError[] };

    const validationErrors = r.message;
    const customErrors = this.validationFilter(validationErrors);

    response.status(statusCode).send({
      statusCode: statusCode,
      data: customErrors,
    });
  }

  private validationFilter(validationErrors: ValidationError[]) {
    const result: { field: string; message: string }[] = [];

    function traverse(error: ValidationError, parentProperty: string = '') {
      const property = parentProperty ? `${parentProperty}` : error.property;

      if (error.constraints) {
        for (const message of Object.values(error.constraints)) {
          const existingError = result.find((err) => err.field === property);
          if (existingError) {
            existingError.message += ', ' + message;
          } else {
            result.push({ field: property, message: message as string });
          }
        }
      }

      if (error.children) {
        for (const child of error.children) {
          traverse(child, property);
        }
      }
    }

    for (const error of validationErrors) {
      traverse(error);
    }

    return result;
  }
}
