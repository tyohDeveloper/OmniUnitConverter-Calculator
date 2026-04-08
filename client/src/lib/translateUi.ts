import type { SupportedLanguage } from './localization';
import enJson from '@/data/localization/ui/en.json';
import enUsJson from '@/data/localization/ui/en-us.json';
import arJson from '@/data/localization/ui/ar.json';
import deJson from '@/data/localization/ui/de.json';
import esJson from '@/data/localization/ui/es.json';
import frJson from '@/data/localization/ui/fr.json';
import itJson from '@/data/localization/ui/it.json';
import jaJson from '@/data/localization/ui/ja.json';
import koJson from '@/data/localization/ui/ko.json';
import ptJson from '@/data/localization/ui/pt.json';
import ruJson from '@/data/localization/ui/ru.json';
import zhJson from '@/data/localization/ui/zh.json';

export const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
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

export function translateUi(key: string, language: SupportedLanguage): string {
  const langMap = UI_TRANSLATIONS[language];
  if (langMap) {
    const val = langMap[key];
    if (val !== undefined) return val;
  }
  return UI_TRANSLATIONS['en'][key] ?? key;
}
