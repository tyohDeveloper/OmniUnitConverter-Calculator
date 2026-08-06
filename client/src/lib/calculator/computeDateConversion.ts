import { Temporal } from '@/lib/temporal/temporal';
import { CONVERSION_DATA } from '../conversion-data';
import type { SupportedLanguage } from '../localization';

/**
 * Convert a date from one calendar system to another (MVP).
 *
 * Input: 'YYYY-MM-DD' interpreted in the from-calendar's own
 * year/month/day scheme (e.g. '5786-11-22' with Hebrew selected =
 * Hebrew year 5786, month 11, day 22). Empty string = today.
 * Anything else → null.
 *
 * Deferred: julian + revised-julian need the custom JDN module
 * (step 7f); iso8601 lives in the variants group (step 7h). Returns
 * null when any of those is the source or target.
 *
 * Output via Intl.DateTimeFormat with the app's `language` value
 * (which is really a BCP-47 locale code per SupportedLanguage's
 * misnomer). CLDR handles month names, era labels, and stem-branch
 * year names for Chinese/Dangi automatically.
 */
export function computeDateConversion(input: {
  value: string;
  fromUnit: string;
  toUnit: string;
  language: SupportedLanguage;
}): string | null {
  const symbols = resolveCalendarSymbols(input.fromUnit, input.toUnit);
  if (!symbols) return null;
  if (isDeferredCalendar(symbols.from) || isDeferredCalendar(symbols.to)) return null;
  const parsed = parseDateInput(input.value.trim(), symbols.from);
  if (!parsed) return null;
  return formatDateInCalendar(parsed, symbols.to, input.language);
}

// ─── Local helpers ───

// Calendars deferred to later sub-steps of the Date category work.
// julian + revised-julian need the JDN module (7f); iso8601 lives
// in the variants group (7h) and needs signed-year parsing.
function isDeferredCalendar(symbol: string): boolean {
  return symbol === 'julian' || symbol === 'revised-julian' || symbol === 'iso8601';
}

function resolveCalendarSymbols(fromUnitId: string, toUnitId: string): { from: string; to: string } | null {
  const cat = CONVERSION_DATA.find(c => c.id === 'date_calendar');
  if (!cat) return null;
  const fromUnit = cat.units.find(u => u.id === fromUnitId);
  const toUnit = cat.units.find(u => u.id === toUnitId);
  if (!fromUnit || !toUnit) return null;
  return { from: fromUnit.symbol, to: toUnit.symbol };
}

// Empty input → today (in ISO/gregorian; withCalendar re-projects
// later). Non-empty must match YYYY-MM-DD in the from-calendar's own
// scheme. Returns a PlainDate whose calendar backend is fromSymbol.
function parseDateInput(value: string, fromSymbol: string): Temporal.PlainDate | null {
  try {
    if (value === '') {
      return Temporal.Now.plainDateISO();
    }
    const match = /^(-?\d{1,6})-(\d{1,2})-(\d{1,2})$/.exec(value);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (month < 1 || month > 13 || day < 1 || day > 31) return null;
    return Temporal.PlainDate.from({ year, month, day, calendar: fromSymbol });
  } catch {
    return null;
  }
}

// Formats via Intl.DateTimeFormat with era short (calendars that don't
// support era get an empty era slot, filtered out here). Chinese and
// Dangi use relatedYear + yearName parts automatically.
function formatDateInCalendar(from: Temporal.PlainDate, toSymbol: string, language: SupportedLanguage): string | null {
  try {
    const projected = from.withCalendar(toSymbol);
    const fmt = new Intl.DateTimeFormat(language, {
      calendar: toSymbol, year: 'numeric', month: 'long', day: 'numeric', era: 'short',
    });
    // toPlainDateTime + ISO string via Temporal is finicky; use the
    // legacy Date bridge via epochMilliseconds. The specific instant
    // doesn't matter because we only render the date part.
    const jsDate = new Date(projected.toZonedDateTime('UTC').epochMilliseconds);
    return fmt.format(jsDate);
  } catch {
    return null;
  }
}
