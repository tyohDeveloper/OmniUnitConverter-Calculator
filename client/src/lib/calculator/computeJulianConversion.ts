import { Temporal } from '@/lib/temporal/temporal';
import type { SupportedLanguage } from '../localization';
import {
  gregorianToJDN, julianToJDN, jdnToJulian, jdnToGregorian,
  isInRevisedJulianEquivalenceWindow,
} from '@/lib/temporal/julianJdn';
import type { JulianDate } from '@/lib/temporal/julianJdn';

/**
 * Julian and Revised Julian parse+format helpers used by
 * computeDateConversion. Temporal doesn't ship these as backend
 * calendars, so we pivot through Julian Day Number (JDN).
 *
 * Multi-export exemption: the four helpers here (parse + format for
 * Julian, parse + format for Revised Julian) share a single semantic
 * subject (custom-calendar dispatch for computeDateConversion) and
 * are always imported together by the parent dispatcher.
 */

// Parse a {y,m,d} typed in Julian scheme into a canonical gregory
// PlainDate. The JDN pivot exactly aligns days across calendars.
export function parseJulianYMD(ymd: JulianDate): Temporal.PlainDate | null {
  try {
    const jdn = julianToJDN(ymd.year, ymd.month, ymd.day);
    const g = jdnToGregorian(jdn);
    return Temporal.PlainDate.from({ year: g.year, month: g.month, day: g.day, calendar: 'gregory' });
  } catch { return null; }
}

// Parse a {y,m,d} typed in Revised Julian scheme. RJ = Gregorian in
// the 1600-03-01 to 2800-02-28 window; return null outside it.
export function parseRevisedJulianYMD(ymd: JulianDate): Temporal.PlainDate | null {
  if (!isInRevisedJulianEquivalenceWindow(ymd.year, ymd.month, ymd.day)) return null;
  try {
    return Temporal.PlainDate.from({ year: ymd.year, month: ymd.month, day: ymd.day, calendar: 'gregory' });
  } catch { return null; }
}

// Format a canonical (gregory) PlainDate as a Julian-shaped string.
// Renders using a gregory proxy PlainDate so we can piggyback on
// CLDR's Roman month names and AD/BC era labels.
export function formatAsJulian(from: Temporal.PlainDate, language: SupportedLanguage): string | null {
  try {
    const g = from.withCalendar('gregory');
    const jdn = gregorianToJDN(g.year, g.month, g.day);
    const j = jdnToJulian(jdn);
    return formatViaGregoryProxy(j, language);
  } catch { return null; }
}

// Format as Revised Julian: if the gregory projection is in-window,
// straight gregory formatting is exact (RJ ≡ gregory there).
export function formatAsRevisedJulian(from: Temporal.PlainDate, language: SupportedLanguage): string | null {
  try {
    const g = from.withCalendar('gregory');
    if (!isInRevisedJulianEquivalenceWindow(g.year, g.month, g.day)) return null;
    const fmt = new Intl.DateTimeFormat(language, {
      calendar: 'gregory', year: 'numeric', month: 'long', day: 'numeric', era: 'short',
    });
    const jsDate = new Date(from.toZonedDateTime('UTC').epochMilliseconds);
    return fmt.format(jsDate);
  } catch { return null; }
}

function formatViaGregoryProxy(ymd: JulianDate, language: SupportedLanguage): string | null {
  try {
    const proxy = Temporal.PlainDate.from({ year: ymd.year, month: ymd.month, day: ymd.day, calendar: 'gregory' });
    const fmt = new Intl.DateTimeFormat(language, {
      calendar: 'gregory', year: 'numeric', month: 'long', day: 'numeric', era: 'short',
    });
    const jsDate = new Date(proxy.toZonedDateTime('UTC').epochMilliseconds);
    return fmt.format(jsDate);
  } catch { return null; }
}
