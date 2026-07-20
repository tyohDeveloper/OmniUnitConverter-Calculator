import { Temporal } from '@js-temporal/polyfill';
import type { CalendarDateFields } from './calendarDateFields';
import { CALENDAR_ERAS } from './calendarEras';

// Project an ISO date string onto a calendar, returning input fields
// (era/eraYear for era-based calendars, signed year otherwise).
export function isoToCalendarFields(isoDate: string, calendar: string): CalendarDateFields {
  const d = Temporal.PlainDate.from(isoDate).withCalendar(calendar);
  const base = { calendar, month: d.month, day: d.day };
  if (calendar in CALENDAR_ERAS && d.era !== undefined && d.eraYear !== undefined) {
    return { ...base, era: d.era, eraYear: d.eraYear };
  }
  return { ...base, year: d.year };
}
