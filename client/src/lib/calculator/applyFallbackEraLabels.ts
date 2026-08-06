/**
 * Substitute CLDR's untranslated era placeholders with authored labels.
 *
 * CLDR has no era names for the Coptic and Ethiopic calendars, so
 * Intl.DateTimeFormat renders the literal placeholders 'ERA1'/'ERA0'
 * in every locale. We substitute the conventional academic labels:
 * Coptic AM (Anno Martyrum), Ethiopic AM (Amätä Məhrät), and
 * Amätä Aläm AA for the ethioaa epoch. Labels are Latin-script
 * romanizations used across locales, matching the docs' explicit
 * label-authorship policy for calendars CLDR leaves untranslated.
 */

const ERA_FALLBACKS: Record<string, { era1: string; era0: string }> = {
  coptic: { era1: 'AM', era0: 'before AM' },
  ethiopic: { era1: 'AM', era0: 'AA' },
  ethioaa: { era1: 'AM', era0: 'AA' },
};

export function applyFallbackEraLabels(text: string, toCalendarSymbol: string): string {
  const sub = ERA_FALLBACKS[toCalendarSymbol];
  if (!sub) return text;
  return text.split('ERA1').join(sub.era1).split('ERA0').join(sub.era0);
}
