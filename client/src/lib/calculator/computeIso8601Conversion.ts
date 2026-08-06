import type { Temporal } from '@/lib/temporal/temporal';

/**
 * ISO 8601 output formatter.
 *
 * ISO 8601 output is format-locked: YYYY-MM-DD with signed astronomical
 * years. No localization applies (ISO 8601 defines the FORMAT, not
 * calendar names — CLDR does not provide month/era names for the
 * iso8601 calendar). Uses zero-padded month/day; year pads to 4 for
 * positive values and preserves the minus sign for negative years
 * without additional padding beyond 4 digits.
 *
 * Since our gregory-anchored input already lives on the proleptic
 * Gregorian, projecting to iso8601 is a pure re-labeling: the day
 * on the timeline doesn't move. Only the astronomical-year convention
 * (year 0 exists) differs from Common's traditional-year convention.
 * Year 1 CE = ISO year 1; year 1 BCE = ISO year 0; year 2 BCE = -1.
 */
export function formatAsIso8601(from: Temporal.PlainDate): string | null {
  try {
    const iso = from.withCalendar('iso8601');
    const year = iso.year;
    const yearStr = year >= 0
      ? String(year).padStart(4, '0')
      : `-${String(-year).padStart(4, '0')}`;
    const m = String(iso.month).padStart(2, '0');
    const d = String(iso.day).padStart(2, '0');
    return `${yearStr}-${m}-${d}`;
  } catch { return null; }
}
