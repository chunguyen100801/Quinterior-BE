//https://github.com/toonvanstrijp/nestjs-i18n/blob/main/src/filters/i18n-validation-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ValidationError,
} from '@nestjs/common';
import iterate from 'iterare';
import {
  I18nContext,
  I18nValidationError,
  I18nValidationException,
  I18nValidationExceptionFilterDetailedErrorsOption,
  I18nValidationExceptionFilterErrorFormatterOption,
} from 'nestjs-i18n';
import {
  formatI18nErrors,
  mapChildrenToValidationErrors,
} from 'nestjs-i18n/dist/utils';

type I18nValidationExceptionFilterOptions =
  | I18nValidationExceptionFilterDetailedErrorsOption
  | I18nValidationExceptionFilterErrorFormatterOption;

@Catch(I18nValidationException)
export class I18nValidationExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly options: I18nValidationExceptionFilterOptions = {
      detailedErrors: true,
    },
  ) {}

  catch(exception: I18nValidationException, host: ArgumentsHost) {
    const i18n = I18nContext.current();

    const errors = formatI18nErrors(exception.errors ?? [], i18n.service, {
      lang: i18n.lang,
    });

    const normalizedErrors = this.normalizeValidationErrors(errors);

    const customErrors = this.validationFilter(
      normalizedErrors as ValidationError[],
    );

    const response = host.switchToHttp().getResponse();
    const responseBody = this.buildResponseBody(host, exception, customErrors);
    response
      .status(this.options.errorHttpStatusCode || exception.getStatus())
      .send(responseBody);
  }

  protected normalizeValidationErrors(
    validationErrors: ValidationError[],
  ): string[] | I18nValidationError[] | object {
    if (
      this.isWithErrorFormatter(this.options) &&
      !('detailedErrors' in this.options)
    )
      return this.options.errorFormatter(validationErrors);

    if (
      !this.isWithErrorFormatter(this.options) &&
      !this.options.detailedErrors
    )
      return this.flattenValidationErrors(validationErrors);

    return validationErrors;
  }

  protected flattenValidationErrors(
    validationErrors: ValidationError[],
  ): string[] {
    return iterate(validationErrors)
      .map((error) => mapChildrenToValidationErrors(error))
      .flatten()
      .filter((item) => !!item.constraints)
      .map((item) => Object.values(item.constraints))
      .flatten()
      .toArray();
  }

  protected buildResponseBody(
    host: ArgumentsHost,
    exc: I18nValidationException,
    errors: string[] | I18nValidationError[] | object,
  ) {
    if ('responseBodyFormatter' in this.options) {
      return this.options.responseBodyFormatter(host, exc, errors);
    } else {
      return {
        statusCode:
          this.options.errorHttpStatusCode === undefined
            ? exc.getStatus()
            : this.options.errorHttpStatusCode,
        message: exc.getResponse(),
        errors,
      };
    }
  }

  private isWithErrorFormatter(
    options: I18nValidationExceptionFilterOptions,
  ): options is I18nValidationExceptionFilterErrorFormatterOption {
    return 'errorFormatter' in options;
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
