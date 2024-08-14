import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';
import { ROLES } from '../decorators';
import { Reflector } from '@nestjs/core';
import { isEmpty } from 'lodash';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles: string[] = this.reflector.getAllAndOverride(ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isEmpty(roles)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return roles.includes(user.role as unknown as string);
  }
}
