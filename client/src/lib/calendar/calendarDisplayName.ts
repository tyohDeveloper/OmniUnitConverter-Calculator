import { CALENDAR_ENGLISH_NAMES } from './calendarEnglishNames';

// Localized calendar name via Intl.DisplayNames, falling back to the
// English name map when unsupported or uncovered.
export function calendarDisplayName(calendar: string, locale: string): string {
  const fallback = CALENDAR_ENGLISH_NAMES[calendar] ?? calendar;
  if (calendar === 'iso8601') return fallback;
  try {
    const dn = new Intl.DisplayNames([locale], { type: 'calendar' });
    const name = dn.of(calendar);
    if (name && name !== calendar) return name;
  } catch {
    // Intl.DisplayNames unavailable or calendar not covered — use fallback.
  }
  return fallback;
}
