/**
 * Julian Day Number (JDN) converters for the Julian and Revised
 * Julian calendars, which Temporal does not ship as backend calendars.
 *
 * Uses the canonical Fliegel-Van Flandern algorithms (see design
 * brief §Custom Julian / Revised Julian module). JDN is a monotonic
 * integer count of days since 4713 BCE; converting between calendars
 * through JDN is exact and handles the 1582 Julian→Gregorian
 * transition transparently (no missing days, no gaps).
 *
 * Revised Julian handling: from 1 March 1600 CE through 28 February
 * 2800 CE the Revised Julian calendar coincides exactly with the
 * proleptic Gregorian calendar. For correspondence-scale use every
 * relevant date falls in that window, so we treat Revised Julian as
 * Gregorian in that range. Dates outside the window return null; if
 * users need pre-1600 or post-2800 Revised Julian dates we can add
 * proper leap-rule support later.
 */

export interface JulianDate {
  year: number;
  month: number;
  day: number;
}

// ─── Fliegel-Van Flandern converters ───

export function gregorianToJDN(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy
    + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

export function julianToJDN(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy
    + Math.floor(yy / 4) - 32083;
}

export function jdnToJulian(jdn: number): JulianDate {
  const c = jdn + 32082;
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

export function jdnToGregorian(jdn: number): JulianDate {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor(146097 * b / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

// ─── Revised Julian window helper ───

// Returns true if a Gregorian {year,month,day} falls in the window
// where Revised Julian coincides with Gregorian: 1600-03-01 through
// 2800-02-28 inclusive.
export function isInRevisedJulianEquivalenceWindow(y: number, m: number, d: number): boolean {
  if (y < 1600 || y > 2800) return false;
  if (y === 1600 && (m < 3 || (m === 3 && d < 1))) return false;
  if (y === 2800 && (m > 2 || (m === 2 && d > 28))) return false;
  return true;
}

// Revised Julian leap rule (per design brief); usable for out-of-
// window conversion when we eventually implement it.
export function isRevisedJulianLeap(year: number): boolean {
  if (year % 4 !== 0) return false;
  if (year % 100 !== 0) return true;
  const r = year % 900;
  return r === 200 || r === 600;
}
