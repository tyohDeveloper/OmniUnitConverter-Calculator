import type { SupportedLanguage } from '../localization';

/**
 * Per-locale substitution for CE/BCE era labels when the target
 * calendar is 'common'.
 *
 * CLDR renders Christian-era abbreviations for the gregory calendar
 * in most locales — AD/BC in English, n. Chr./v. Chr. in German,
 * d. C./a. C. in Spanish, etc. When our target is 'common' we want
 * religiously-neutral labels drawn from academic convention in each
 * language.
 *
 * Locales absent from the substitution table (ja, zh, ru, ar)
 * already render religiously-neutral terms via CLDR — Japanese
 * 西暦/紀元前, Chinese 公元/公元前, Russian н.э./до н.э., Arabic م/ق.م —
 * and need no substitution.
 */

const SUBSTITUTIONS: Partial<Record<SupportedLanguage, {
  ad: string; adCE: string; bc: string; bcBCE: string;
}>> = {
  'en':    { ad: 'AD',         adCE: 'CE',     bc: 'BC',         bcBCE: 'BCE' },
  'en-us': { ad: 'AD',         adCE: 'CE',     bc: 'BC',         bcBCE: 'BCE' },
  'ko':    { ad: 'AD',         adCE: 'CE',     bc: 'BC',         bcBCE: 'BCE' },
  'de':    { ad: 'n. Chr.',    adCE: 'u. Z.',  bc: 'v. Chr.',    bcBCE: 'v. u. Z.' },
  'es':    { ad: 'd. C.',      adCE: 'e. c.',  bc: 'a. C.',      bcBCE: 'a. e. c.' },
  'fr':    { ad: 'ap. J.-C.',  adCE: 'EC',     bc: 'av. J.-C.',  bcBCE: 'AEC' },
  'it':    { ad: 'd.C.',       adCE: 'E.V.',   bc: 'a.C.',       bcBCE: 'A.E.V.' },
  'pt':    { ad: 'd.C.',       adCE: 'E.C.',   bc: 'a.C.',       bcBCE: 'A.E.C.' },
};

export function applyCommonEraLabels(text: string, toUnit: string, language: SupportedLanguage): string {
  if (toUnit !== 'common') return text;
  const sub = SUBSTITUTIONS[language];
  if (!sub) return text;
  return text.split(sub.bc).join(sub.bcBCE).split(sub.ad).join(sub.adCE);
}
