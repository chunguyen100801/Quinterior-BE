import {
  applyDecorators,
  Param,
  ParseUUIDPipe,
  type PipeTransform,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { type Type } from '@nestjs/common/interfaces';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { UserRole } from '@prisma/db-api';
import { Roles } from './roles.decorator';
import { AuthGuard, RolesGuard } from '../guards';
import { AuthUserInterceptor } from '../interceptors';
import { PublicRoute } from './auth.decorator';

export function Auth(
  roles: UserRole[] = [],
  options?: Partial<{ public: boolean }>,
): MethodDecorator {
  const isPublicRoute = options?.public;

  return applyDecorators(
    Roles(...roles),
    UseGuards(AuthGuard({ public: isPublicRoute }), RolesGuard),
    ApiBearerAuth(),
    UseInterceptors(AuthUserInterceptor),
    ApiUnauthorizedResponse({
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
    PublicRoute(isPublicRoute),
  );
}

export function UUIDParam(
  property: string,
  ...pipes: Array<Type<PipeTransform> | PipeTransform>
): ParameterDecorator {
  return Param(property, new ParseUUIDPipe({ version: '4' }), ...pipes);
}
