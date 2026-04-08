export const SUPPORTED_LANGUAGES = [
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

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export { UI_TRANSLATIONS } from './translateUi';
export { UNIT_NAME_TRANSLATIONS } from './translateUnit';

export const SI_SYMBOLS = [
  'm', 'kg', 'g', 's', 'A', 'K', 'mol', 'cd',
  'Hz', 'N', 'Pa', 'J', 'W', 'C', 'V', 'F',
  'Ω', 'S', 'Wb', 'T', 'H', 'lm', 'lx', 'Bq',
  'Gy', 'Sv', 'kat', 'rad', 'sr',
  'm²', 'm³', 'L', 'ha',
];

export const SI_PREFIX_SYMBOLS = [
  'Y', 'Z', 'E', 'P', 'T', 'G', 'M', 'k',
  'c', 'm', 'µ', 'n', 'p', 'f', 'a', 'z', 'y',
];

export const translate = (
  key: string,
  language: SupportedLanguage,
  translations: Record<string, Record<string, string>>
): string => {
  const val = translations[language]?.[key];
  if (val !== undefined) return val;
  return translations['en']?.[key] ?? key;
};
