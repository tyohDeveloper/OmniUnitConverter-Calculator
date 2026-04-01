import type { Translation, SupportedLanguage } from './localization';
import unitNameTranslationsJson from '@/data/localization/unit-name-translations.json';

function asTranslationMap(data: Record<string, { en: string; ar: string; [k: string]: string | undefined }>): Record<string, Translation> {
  return data as Record<string, Translation>;
}

export const UNIT_NAME_TRANSLATIONS: Record<string, Translation> = asTranslationMap(
  unitNameTranslationsJson satisfies Record<string, { en: string; ar: string }>
);

export function translateUnit(key: string, language: SupportedLanguage): string {
  const entry = UNIT_NAME_TRANSLATIONS[key];
  if (!entry) return key;
  if (language === 'en' || language === 'en-us') return entry.en;
  const val = entry[language as keyof Translation];
  if (val) return val as string;
  return entry.en || key;
}
