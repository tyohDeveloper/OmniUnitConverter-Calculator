import type { CalendarDate } from './jdnToGregorian';
import type { HijriEpoch } from './types';
import { hijriYearStartJdn } from './hijriYearStartJdn';
import { hijriMonthStartOffset } from './hijriMonthStartOffset';

// Julian Day Number to tabular Hijri date. Inverse of hijriToJdn.
export function jdnToHijri(jdn: number, epoch: HijriEpoch = 'civil'): CalendarDate {
  let year = Math.floor(((jdn - hijriYearStartJdn(1, epoch)) * 30) / 10631) + 1;
  while (hijriYearStartJdn(year, epoch) > jdn) year -= 1;
  while (hijriYearStartJdn(year + 1, epoch) <= jdn) year += 1;
  const dayOfYear = jdn - hijriYearStartJdn(year, epoch);
  let month = 12;
  while (month > 1 && hijriMonthStartOffset(month) > dayOfYear) month -= 1;
  return { year, month, day: dayOfYear - hijriMonthStartOffset(month) + 1 };
}
