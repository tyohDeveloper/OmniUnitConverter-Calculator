// Tabular (arithmetic) Islamic calendar, whole-year mapping.
// Year mapping convention: a CE year maps to the AH year whose 1 Muharram
// (new year) falls within that CE year; the inverse returns the CE year in
// which 1 Muharram of the given AH year falls. Exact for the tabular
// calendar; observation-based calendars may differ by a day or two.
import { hijriYearStartJdn } from './hijriYearStartJdn';
import { gregorianToJdn } from './gregorianToJdn';
import { jdnToGregorian } from './jdnToGregorian';

export const hijriTabular = {
  fromAstronomical: (astro: number): number => {
    const jan1 = gregorianToJdn(astro, 1, 1);
    let ah = Math.floor(((jan1 - hijriYearStartJdn(1)) * 30) / 10631) + 1;
    while (jdnToGregorian(hijriYearStartJdn(ah)).year > astro) ah -= 1;
    while (jdnToGregorian(hijriYearStartJdn(ah)).year < astro) ah += 1;
    return ah;
  },
  toAstronomical: (ah: number): number =>
    jdnToGregorian(hijriYearStartJdn(ah)).year,
};
