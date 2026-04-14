export const FLASH_DURATION_MS = 300;
export const PASTE_RESET_TIMEOUT_MS = 3000;
export const DEFAULT_PRECISION = 4;

export const FIELD_HEIGHT = '2.5rem';
export const CommonFieldWidth = '285px';
export const OperatorBtnWidth = '32px';
export const ClearBtnWidth = '100px';
export const RpnBtnWidth = '43px';
export const RpnBtnCount = 8;
export const CALC_CONTENT_HEIGHT = '235px';

export const ISO_LANGUAGES = [
  'en',
  'en-us',
  'ar',
  'de',
  'es',
  'fr',
  'it',
  'ja',
  'ko',
  'pt',
  'ru',
  'zh',
] as const;

export type ISOLanguage = typeof ISO_LANGUAGES[number];
