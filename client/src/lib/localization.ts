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

export interface Translation {
  en: string;
  ar: string;
  de?: string;
  es?: string;
  fr?: string;
  it?: string;
  ja?: string;
  ko?: string;
  pt?: string;
  ru?: string;
  zh?: string;
}

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
  translations: Record<string, Translation>
): string => {
  if (!translations[key]) {
    return key;
  }
  
  const trans = translations[key];
  
  if (language === 'en' || language === 'en-us') return trans.en;
  
  const langKey = language as keyof Translation;
  if (trans[langKey]) return trans[langKey] as string;
  
  return trans.en || key;
};
