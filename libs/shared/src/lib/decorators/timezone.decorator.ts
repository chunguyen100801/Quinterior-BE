import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Timezone = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-user-timezone'] || 'UTC';
  },
);
