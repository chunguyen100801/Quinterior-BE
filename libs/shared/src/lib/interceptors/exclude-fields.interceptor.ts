import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { omit } from 'lodash';
import { map } from 'rxjs/operators';

@Injectable()
export class ExcludeFieldsInterceptor implements NestInterceptor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) =>
        response.data
          ? {
              message: response.message,
              data: this.omitFields(response.data),
            }
          : response,
      ),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  omitFields(data: any) {
    if (Array.isArray(data)) {
      return data.map((item) => this.omitFields(item));
    } else if (data && typeof data === 'object') {
      return omit(data, 'deleted', 'deletedAt');
    } else {
      return data;
    }
  }
}
