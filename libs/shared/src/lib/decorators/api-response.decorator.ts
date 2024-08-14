import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiResponseArrayEntity, ApiResponseEntity } from '../entities';
import { Type, applyDecorators } from '@nestjs/common';

export const ApiResponseWithMessage = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(ApiResponseEntity, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseEntity) },
          {
            properties: {
              data: {
                $ref: getSchemaPath(dataDto),
              },
            },
          },
        ],
      },
    }),
  );

export const ApiResponseArrayDataWithMessage = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(ApiResponseArrayEntity, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseArrayEntity) },
          {
            properties: {
              data: {
                type: 'array',
                items: {
                  $ref: getSchemaPath(dataDto),
                },
              },
            },
          },
        ],
      },
    }),
  );
