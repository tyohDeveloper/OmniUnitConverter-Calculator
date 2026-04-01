import type { Translation, SupportedLanguage } from './localization';
import uiTranslationsJson from '@/data/localization/ui-translations.json';

function asTranslationMap(data: Record<string, { en: string; ar: string; [k: string]: string | undefined }>): Record<string, Translation> {
  return data as Record<string, Translation>;
}

export const UI_TRANSLATIONS: Record<string, Translation> = asTranslationMap(
  uiTranslationsJson satisfies Record<string, { en: string; ar: string }>
);

export function translateUi(key: string, language: SupportedLanguage): string {
  const entry = UI_TRANSLATIONS[key];
  if (!entry) return key;
  if (language === 'en' || language === 'en-us') return entry.en;
  const val = entry[language as keyof Translation];
  if (val) return val as string;
  return entry.en || key;
}
