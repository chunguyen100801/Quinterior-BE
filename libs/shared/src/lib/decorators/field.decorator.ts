import { applyDecorators } from '@nestjs/common';
import { ApiProperty, type ApiPropertyOptions } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsDefined,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  NotEquals,
  ValidateNested,
} from 'class-validator';

import { Constructor } from '../@types';
import {
  PhoneNumberSerializer,
  ToArray,
  ToBoolean,
  ToLowerCase,
  ToUpperCase,
} from './transform.decorator';
import {
  IsNullable,
  IsPassword,
  IsPhoneNumber,
  IsTmpKey as IsTemporaryKey,
  IsUndefinable,
} from './validator.decorator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiEnumProperty, ApiUUIDProperty } from './property.decorator';
import { CommonErrorsLocale } from '../i18n/locale-keys/common/errors.locale';

interface IFieldOptions {
  each?: boolean;
  swagger?: boolean;
  nullable?: boolean;
  groups?: string[];
}

interface INumberFieldOptions extends IFieldOptions {
  min?: number;
  max?: number;
  int?: boolean;
  isPositive?: boolean;
}

interface IStringFieldOptions extends IFieldOptions {
  minLength?: number;
  maxLength?: number;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
}

type IClassFieldOptions = IFieldOptions;
type IBooleanFieldOptions = IFieldOptions;
type IEnumFieldOptions = IFieldOptions;

export function NumberField(
  options: Omit<ApiPropertyOptions, 'type'> & INumberFieldOptions = {},
): PropertyDecorator {
  const decorators = [Type(() => Number)];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  if (options.swagger !== false) {
    if (options.each) {
      decorators.push(ApiProperty({ type: [Number], ...options }));
    } else {
      decorators.push(ApiProperty({ type: Number, ...options }));
    }
  }

  if (options.each) {
    decorators.push(ToArray());
  }

  if (options.int) {
    decorators.push(
      IsInt({
        each: options.each,
        message: i18nValidationMessage(
          CommonErrorsLocale.VALIDATOR_IS_INT as string,
        ),
      }),
    );
  } else {
    decorators.push(
      IsNumber(
        {},
        {
          each: options.each,
          message: i18nValidationMessage(
            CommonErrorsLocale.VALIDATOR_IS_NUMBER as string,
          ),
        },
      ),
    );
  }

  if (typeof options.min === 'number') {
    decorators.push(
      Min(options.min, {
        each: options.each,
        message: i18nValidationMessage(
          CommonErrorsLocale.VALIDATOR_MIN as string,
        ),
      }),
    );
  }

  if (typeof options.max === 'number') {
    decorators.push(
      Max(options.max, {
        each: options.each,
        message: i18nValidationMessage(
          CommonErrorsLocale.VALIDATOR_MAX as string,
        ),
      }),
    );
  }

  if (options.isPositive) {
    decorators.push(
      IsPositive({
        each: options.each,
        message: i18nValidationMessage(
          CommonErrorsLocale.VALIDATOR_IS_POSITIVE as string,
        ),
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function NumberFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> &
    INumberFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsUndefinable(),
    NumberField({ required: false, ...options }),
  );
}

export function StringField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    Type(() => String),
    IsString({
      each: options.each,
      message: i18nValidationMessage(
        CommonErrorsLocale.VALIDATOR_IS_STRING as string,
      ),
    }),
  ];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({ type: String, ...options, isArray: options.each }),
    );
  }

  const minLength = options.minLength || 1;

  decorators.push(
    MinLength(minLength, {
      each: options.each,
      message: i18nValidationMessage(
        CommonErrorsLocale.VALIDATOR_MIN_LENGTH as string,
      ),
    }),
  );

  if (options.maxLength) {
    decorators.push(
      MaxLength(options.maxLength, {
        each: options.each,
        message: i18nValidationMessage(
          CommonErrorsLocale.VALIDATOR_MAX_LENGTH as string,
        ),
      }),
    );
  }

  if (options.toLowerCase) {
    decorators.push(ToLowerCase());
  }

  if (options.toUpperCase) {
    decorators.push(ToUpperCase());
  }

  return applyDecorators(...decorators);
}

export function StringFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> &
    IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsUndefinable(),
    StringField({ required: false, ...options }),
  );
}

export function PasswordField(
  options: Omit<ApiPropertyOptions, 'type' | 'minLength'> &
    IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    StringField({ ...options, minLength: 6 }),
    IsPassword({
      message: i18nValidationMessage(
        CommonErrorsLocale.VALIDATOR_WEAK_PASSWORD as string,
      ),
    }),
  ];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  return applyDecorators(...decorators);
}

export function PasswordFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'minLength'> &
    IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsUndefinable(),
    PasswordField({ required: false, ...options }),
  );
}

export function BooleanField(
  options: Omit<ApiPropertyOptions, 'type'> & IBooleanFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    ToBoolean(),
    IsBoolean({
      each: options.each,
      message: i18nValidationMessage(
        CommonErrorsLocale.VALIDATOR_IS_BOOLEAN as string,
      ),
    }),
  ];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ type: Boolean, ...options }));
  }

  return applyDecorators(...decorators);
}

export function BooleanFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> &
    IBooleanFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsUndefinable(),
    BooleanField({ required: false, ...options }),
  );
}

export function TmpKeyField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    StringField(options),
    IsTemporaryKey({
      each: options.each,
      message: i18nValidationMessage(
        CommonErrorsLocale.VALIDATOR_IS_TMP_KEY as string,
      ),
    }),
  ];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({ type: String, ...options, isArray: options.each }),
    );
  }

  return applyDecorators(...decorators);
}

export function TmpKeyFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> &
    IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsUndefinable(),
    TmpKeyField({ required: false, ...options }),
  );
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function EnumField<TEnum extends object>(
  getEnum: () => TEnum,
  options: Omit<ApiPropertyOptions, 'type' | 'enum' | 'enumName' | 'isArray'> &
    IEnumFieldOptions = {},
): PropertyDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/ban-types
  const enumValue = getEnum();
  const decorators = [
    IsEnum(enumValue, {
      each: options.each,
      message: i18nValidationMessage(
        CommonErrorsLocale.VALIDATOR_IS_ENUM as string,
      ),
    }),
  ];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.each) {
    decorators.push(ToArray());
  }

  if (options.swagger !== false) {
    decorators.push(
      ApiEnumProperty(getEnum, { ...options, isArray: options.each }),
    );
  }

  return applyDecorators(...decorators);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function ClassField<TClass extends Constructor>(
  getClass: () => TClass,
  options: Omit<ApiPropertyOptions, 'type'> & IClassFieldOptions = {},
): PropertyDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const classValue = getClass();

  const decorators = [
    Type(() => classValue),
    ValidateNested({ each: options.each }),
  ];

  if (options.required !== false) {
    decorators.push(
      IsDefined({
        message: i18nValidationMessage(
          CommonErrorsLocale.VALIDATOR_IS_NOT_EMPTY as string,
        ),
      }),
    );
  }

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({
        type: () => classValue,
        ...options,
      }),
    );
  }

  // if (options.each) {
  //   decorators.push(ToArray());
  // }

  return applyDecorators(...decorators);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function EnumFieldOptional<TEnum extends object>(
  getEnum: () => TEnum,
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'enum' | 'enumName'> &
    IEnumFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsUndefinable(),
    EnumField(getEnum, { required: false, ...options }),
  );
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function ClassFieldOptional<TClass extends Constructor>(
  getClass: () => TClass,
  options: Omit<ApiPropertyOptions, 'type' | 'required'> &
    IClassFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsUndefinable(),
    ClassField(getClass, { required: false, ...options }),
  );
}

export function EmailField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    IsEmail(
      {},
      {
        message: i18nValidationMessage(
          CommonErrorsLocale.VALIDATOR_IS_EMAIL as string,
        ),
      },
    ),
    StringField({ toLowerCase: true, ...options }),
  ];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ type: String, ...options }));
  }

  return applyDecorators(...decorators);
}

export function EmailFieldOptional(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsUndefinable(),
    EmailField({ required: false, ...options }),
  );
}

export function PhoneField(
  options: Omit<ApiPropertyOptions, 'type'> & IFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    IsPhoneNumber({
      message: i18nValidationMessage(
        CommonErrorsLocale.VALIDATOR_IS_PHONE_NUMBER as string,
      ),
    }),
    PhoneNumberSerializer(),
  ];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ type: String, ...options }));
  }

  return applyDecorators(...decorators);
}

export function PhoneFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsUndefinable(),
    PhoneField({ required: false, ...options }),
  );
}

export function UUIDField(
  options: Omit<ApiPropertyOptions, 'type' | 'format' | 'isArray'> &
    IFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    Type(() => String),
    IsUUID('4', {
      each: options.each,
      message: i18nValidationMessage(
        CommonErrorsLocale.VALIDATOR_IS_UUID as string,
      ),
    }),
  ];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(ApiUUIDProperty(options));
  }

  if (options.each) {
    decorators.push(ToArray());
  }

  return applyDecorators(...decorators);
}

export function UUIDFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'isArray'> &
    IFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsUndefinable(),
    UUIDField({ required: false, ...options }),
  );
}

export function URLField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [StringField(options), IsUrl({}, { each: true })];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  return applyDecorators(...decorators);
}

export function URLFieldOptional(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsUndefinable(),
    URLField({ required: false, ...options }),
  );
}

export function DateField(
  options: Omit<ApiPropertyOptions, 'type'> & IFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    Type(() => Date),
    IsDate({
      message: i18nValidationMessage(
        CommonErrorsLocale.VALIDATOR_IS_DATE as string,
      ),
    }),
  ];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ type: Date, ...options }));
  }

  return applyDecorators(...decorators);
}

export function DateFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsUndefinable(),
    DateField({ ...options, required: false }),
  );
}
