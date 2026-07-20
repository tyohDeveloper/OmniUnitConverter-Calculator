import type { HijriEpoch } from './types';
import { hijriYearStartJdn } from './hijriYearStartJdn';
import { hijriMonthStartOffset } from './hijriMonthStartOffset';

// Tabular Hijri date (AH year, month 1–12, day 1–30) to Julian Day Number.
export function hijriToJdn(ah: number, month: number, day: number, epoch: HijriEpoch = 'civil'): number {
  return hijriYearStartJdn(ah, epoch) + hijriMonthStartOffset(month) + day - 1;
}
