import { hijriYearStartJdn } from './hijriYearStartJdn';
import { hijriMonthStartOffset } from './hijriMonthStartOffset';

// Tabular Hijri date (AH year, month 1–12, day 1–30) to Julian Day Number.
export function hijriToJdn(ah: number, month: number, day: number): number {
  return hijriYearStartJdn(ah) + hijriMonthStartOffset(month) + day - 1;
}
