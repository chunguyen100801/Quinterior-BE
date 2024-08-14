import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

export const PublicRoute = (isPublic = false): CustomDecorator =>
  SetMetadata(IS_PUBLIC_KEY, isPublic);
