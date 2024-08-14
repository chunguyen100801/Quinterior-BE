export enum ENUM_LANGUAGE {
  EN = 'en',
  ID = 'id',
}

export const SUPPORTED_LANGUAGE = Object.values(ENUM_LANGUAGE);

export const SUPPORTED_LANGUAGE_COUNT = SUPPORTED_LANGUAGE.length;
export const DEFAULT_LANGUAGE = ENUM_LANGUAGE.EN;
