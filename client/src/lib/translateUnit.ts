import type { SupportedLanguage } from './localization';
import enJson from '@/data/localization/units/en.json';
import enUsJson from '@/data/localization/units/en-us.json';
import arJson from '@/data/localization/units/ar.json';
import deJson from '@/data/localization/units/de.json';
import esJson from '@/data/localization/units/es.json';
import frJson from '@/data/localization/units/fr.json';
import itJson from '@/data/localization/units/it.json';
import jaJson from '@/data/localization/units/ja.json';
import koJson from '@/data/localization/units/ko.json';
import ptJson from '@/data/localization/units/pt.json';
import ruJson from '@/data/localization/units/ru.json';
import zhJson from '@/data/localization/units/zh.json';

export const UNIT_NAME_TRANSLATIONS: Record<string, Record<string, string>> = {
  'en': enJson as Record<string, string>,
  'en-us': enUsJson as Record<string, string>,
  'ar': arJson as Record<string, string>,
  'de': deJson as Record<string, string>,
  'es': esJson as Record<string, string>,
  'fr': frJson as Record<string, string>,
  'it': itJson as Record<string, string>,
  'ja': jaJson as Record<string, string>,
  'ko': koJson as Record<string, string>,
  'pt': ptJson as Record<string, string>,
  'ru': ruJson as Record<string, string>,
  'zh': zhJson as Record<string, string>,
};

export function translateUnit(key: string, language: SupportedLanguage): string {
  const langMap = UNIT_NAME_TRANSLATIONS[language];
  if (langMap) {
    const val = langMap[key];
    if (val !== undefined) return val;
  }
  return UNIT_NAME_TRANSLATIONS['en'][key] ?? key;
}
