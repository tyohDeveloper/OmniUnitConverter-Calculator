import { Temporal } from '@js-temporal/polyfill';
import type { CalendarDateFields } from './calendarDateFields';

export interface CalendarMonthOption {
  month: number;
  monthCode: string;
  daysInMonth: number;
  label: string;
}

// List the months of the calendar year identified by `fields` (year or
// era/eraYear), with localized month names via Intl. Handles leap-month
// years in lunisolar calendars (Hebrew, Chinese, Dangi) since the month
// count and names come from Temporal for that specific year.
export function listCalendarMonths(
  fields: Pick<CalendarDateFields, 'calendar' | 'era' | 'eraYear' | 'year'>,
  locale: string,
): CalendarMonthOption[] {
  const { calendar, era, eraYear, year } = fields;
  const yearFields = era !== undefined && eraYear !== undefined ? { era, eraYear } : { year: year ?? NaN };
  const first = Temporal.PlainDate.from({ calendar, ...yearFields, month: 1, day: 1 });
  const fmt = new Intl.DateTimeFormat(locale, { calendar, month: 'long', timeZone: 'UTC' });
  const options: CalendarMonthOption[] = [];
  for (let m = 1; m <= first.monthsInYear; m++) {
    const d = first.with({ month: m }, { overflow: 'constrain' });
    const iso = d.withCalendar('iso8601').toString();
    options.push({ month: m, monthCode: d.monthCode, daysInMonth: d.daysInMonth, label: fmt.format(new Date(`${iso}T12:00:00Z`)) });
  }
  return options;
}
