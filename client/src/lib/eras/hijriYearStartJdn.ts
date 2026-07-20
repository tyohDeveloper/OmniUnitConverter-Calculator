// Tabular (arithmetic) Islamic calendar, civil epoch: 1 Muharram AH 1 =
// 16 July 622 CE (Julian) = JDN 1948440. 30-year cycle of 10631 days with
// 11 leap years; leap-day count in the first n years = floor((11n + 3) / 30).
const HIJRI_EPOCH_JDN = 1948440;

export function hijriYearStartJdn(ah: number): number {
  const n = ah - 1;
  return HIJRI_EPOCH_JDN + 354 * n + Math.floor((11 * n + 3) / 30);
}
