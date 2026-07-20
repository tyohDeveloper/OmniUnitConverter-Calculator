import type { HijriEpoch } from './types';

// Tabular (arithmetic) Islamic calendar. Civil epoch: 1 Muharram AH 1 =
// 16 July 622 CE (Julian) = JDN 1948440; astronomical epoch is one day
// earlier (Thursday, 15 July 622 = JDN 1948439). 30-year cycle of 10631
// days with 11 leap years; leap-day count = floor((11n + 3) / 30).
const HIJRI_CIVIL_EPOCH_JDN = 1948440;

export function hijriYearStartJdn(ah: number, epoch: HijriEpoch = 'civil'): number {
  const n = ah - 1;
  const epochJdn = epoch === 'astronomical' ? HIJRI_CIVIL_EPOCH_JDN - 1 : HIJRI_CIVIL_EPOCH_JDN;
  return epochJdn + 354 * n + Math.floor((11 * n + 3) / 30);
}
