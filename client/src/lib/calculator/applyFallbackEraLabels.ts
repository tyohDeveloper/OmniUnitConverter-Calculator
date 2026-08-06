/**
 * Substitute CLDR's untranslated era placeholders with authored labels.
 *
 * In some browser CLDR builds the era name for Coptic and Ethiopic
 * calendars is missing, so Intl.DateTimeFormat renders the literal
 * placeholders 'ERA1' (post-epoch) or 'ERA0' (pre-epoch). We
 * substitute the conventional academic labels:
 *
 * - Coptic: ERA1 = AM (Anno Martyrum, post-Diocletian AD 284+),
 *   ERA0 = BD (Before Diocletian).
 * - Ethiopic: ERA1 = AM (Amätä Məḥrät, post-incarnation),
 *   ERA0 = AA (Amätä Aläm, pre-incarnation).
 * - Ethioaa: single-era Amätä Aläm calendar; both ERA1 and ERA0 map
 *   to AA since there's only one era.
 *
 * Labels are Latin-script romanizations used across all locales,
 * following the docs' label-authorship policy for calendars CLDR
 * leaves untranslated (per the design brief's era-labeling section).
 *
 * Node's current CLDR data renders these labels natively and does
 * not emit the ERA1/ERA0 placeholders; this module is defensive for
 * older browser Intl runtimes where the CLDR data is more limited.
 */

const ERA_FALLBACKS: Record<string, { era1: string; era0: string }> = {
  coptic:   { era1: 'AM', era0: 'BD' },
  ethiopic: { era1: 'AM', era0: 'AA' },
  ethioaa:  { era1: 'AA', era0: 'AA' },
};

export function applyFallbackEraLabels(text: string, toCalendarSymbol: string): string {
  const sub = ERA_FALLBACKS[toCalendarSymbol];
  if (!sub) return text;
  return text.split('ERA1').join(sub.era1).split('ERA0').join(sub.era0);
}
