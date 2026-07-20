import { CALENDAR_ERAS } from './calendarEras';

// Format an ISO date string (YYYY-MM-DD) in the given calendar and locale
// using the browser's Intl.DateTimeFormat.
export function formatCalendarDate(isoDate: string, calendar: string, locale: string): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  const withEra = calendar in CALENDAR_ERAS || calendar === 'japanese';
  const fmt = new Intl.DateTimeFormat(locale, {
    calendar,
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(withEra ? { era: 'short' as const } : {}),
  });
  return fmt.format(date);
}
