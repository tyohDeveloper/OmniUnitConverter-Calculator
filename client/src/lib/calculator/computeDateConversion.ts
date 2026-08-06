import { Temporal } from '@/lib/temporal/temporal';
import { CONVERSION_DATA } from '../conversion-data';
import type { SupportedLanguage } from '../localization';
import type { JulianDate } from '@/lib/temporal/julianJdn';
import {
  parseJulianYMD, parseRevisedJulianYMD,
  formatAsJulian, formatAsRevisedJulian,
} from './computeJulianConversion';
import { formatAsIso8601 } from './computeIso8601Conversion';
import { applyCommonEraLabels } from './applyCommonEraLabels';

/**
 * Convert a date from one calendar system to another (MVP).
 *
 * Input: 'YYYY-MM-DD' interpreted in the from-calendar's own
 * year/month/day scheme (e.g. '5786-11-22' with Hebrew selected =
 * Hebrew year 5786, month 11, day 22). Empty string = today.
 * Anything else → null.
 *
 * Julian and Revised Julian route through the Fliegel-Van Flandern
 * JDN converters (see computeJulianConversion.ts). All 19 calendars
 * from the registry are supported.
 *
 * Output via Intl.DateTimeFormat with the app's `language` value
 * (which is really a BCP-47 locale code). CLDR handles month names,
 * era labels, and stem-branch year names automatically.
 */
export function computeDateConversion(input: {
  value: string;
  fromUnit: string;
  toUnit: string;
  language: SupportedLanguage;
}): string | null {
  const symbols = resolveCalendarSymbols(input.fromUnit, input.toUnit);
  if (!symbols) return null;
  const parsed = parseDateInAnyCalendar(input.value.trim(), symbols.from);
  if (!parsed) return null;
  const formatted = formatDateInAnyCalendar(parsed, symbols.to, input.language);
  if (formatted === null) return null;
  return applyCommonEraLabels(formatted, input.toUnit, input.language);
}

// ─── Local helpers ───

function resolveCalendarSymbols(fromUnitId: string, toUnitId: string): { from: string; to: string } | null {
  const cat = CONVERSION_DATA.find(c => c.id === 'date_calendar');
  if (!cat) return null;
  const fromUnit = cat.units.find(u => u.id === fromUnitId);
  const toUnit = cat.units.find(u => u.id === toUnitId);
  if (!fromUnit || !toUnit) return null;
  return { from: fromUnit.symbol, to: toUnit.symbol };
}

function parseDateInAnyCalendar(value: string, fromSymbol: string): Temporal.PlainDate | null {
  const ymd = parseYMD(value);
  if (!ymd) return null;
  if (fromSymbol === 'julian') return parseJulianYMD(ymd);
  if (fromSymbol === 'revised-julian') return parseRevisedJulianYMD(ymd);
  try {
    return Temporal.PlainDate.from({ year: ymd.year, month: ymd.month, day: ymd.day, calendar: fromSymbol });
  } catch { return null; }
}

function parseYMD(value: string): JulianDate | null {
  if (value === '') {
    const t = Temporal.Now.plainDateISO();
    return { year: t.year, month: t.month, day: t.day };
  }
  const match = /^(-?\d{1,6})-(\d{1,2})-(\d{1,2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 13 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function formatDateInAnyCalendar(from: Temporal.PlainDate, toSymbol: string, language: SupportedLanguage): string | null {
  if (toSymbol === 'julian') return formatAsJulian(from, language);
  if (toSymbol === 'revised-julian') return formatAsRevisedJulian(from, language);
  if (toSymbol === 'iso8601') return formatAsIso8601(from);
  try {
    const projected = from.withCalendar(toSymbol);
    const fmt = new Intl.DateTimeFormat(language, {
      calendar: toSymbol, year: 'numeric', month: 'long', day: 'numeric', era: 'short',
    });
    const jsDate = new Date(projected.toZonedDateTime('UTC').epochMilliseconds);
    return fmt.format(jsDate);
  } catch { return null; }
}
