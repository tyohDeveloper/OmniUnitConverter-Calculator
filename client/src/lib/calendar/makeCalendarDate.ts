import { Temporal } from '@js-temporal/polyfill';
import type { CalendarDateFields } from './calendarDateFields';

export type CalendarDateResult =
  | { ok: true; isoDate: string }
  | { ok: false; error: string };

// Build a Temporal.PlainDate from calendar-specific input fields with strict
// validation (overflow: 'reject'). Returns the ISO date string on success,
// or an error message on invalid input — never a silent fallback.
export function makeCalendarDate(fields: CalendarDateFields): CalendarDateResult {
  const { calendar, era, eraYear, year, month, day } = fields;
  const yearFields = era !== undefined && eraYear !== undefined
    ? { era, eraYear }
    : { year: year ?? NaN };
  try {
    const date = Temporal.PlainDate.from(
      { calendar, ...yearFields, month, day },
      { overflow: 'reject' },
    );
    return { ok: true, isoDate: date.withCalendar('iso8601').toString() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
