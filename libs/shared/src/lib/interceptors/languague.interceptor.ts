import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { type Observable } from 'rxjs';

import { ContextProvider } from '../providers';
import { ENUM_LANGUAGE } from '../@types';

@Injectable()
export class LanguageInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<undefined> {
    const request = context.switchToHttp().getRequest();
    const language: string = request.headers['x-language-code'];

    if (ENUM_LANGUAGE[language]) {
      ContextProvider.setLanguage(language);
    }

    return next.handle();
  }
}

export function UseLanguageInterceptor() {
  return UseInterceptors(LanguageInterceptor);
}
