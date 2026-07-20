// Tabular (arithmetic) Islamic calendar, civil epoch: 1 Muharram AH 1 =
// 16 July 622 CE (Julian) = JDN 1948440. 30-year cycle of 10631 days with
// 11 leap years; leap-day count in the first n years = floor((11n + 3) / 30).
// Year mapping convention: a CE year maps to the AH year whose 1 Muharram
// (new year) falls within that CE year; the inverse returns the CE year in
// which 1 Muharram of the given AH year falls. Exact for the tabular
// calendar; observation-based calendars may differ by a day or two.
const HIJRI_EPOCH_JDN = 1948440;

function hijriYearStartJdn(ah: number): number {
  const n = ah - 1;
  return HIJRI_EPOCH_JDN + 354 * n + Math.floor((11 * n + 3) / 30);
}

// JDN of 1 January of a proleptic Gregorian (astronomical) year.
function jan1Jdn(year: number): number {
  const y = year + 4799;
  return (
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    31738
  );
}

// Proleptic Gregorian year containing a given Julian Day Number.
function gregorianYearOfJdn(jdn: number): number {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return 100 * b + d - 4800 + Math.floor(m / 10);
}

export const hijriTabular = {
  fromAstronomical: (astro: number): number => {
    let ah = Math.floor(((jan1Jdn(astro) - HIJRI_EPOCH_JDN) * 30) / 10631) + 1;
    while (gregorianYearOfJdn(hijriYearStartJdn(ah)) > astro) ah -= 1;
    while (gregorianYearOfJdn(hijriYearStartJdn(ah)) < astro) ah += 1;
    return ah;
  },
  toAstronomical: (ah: number): number =>
    gregorianYearOfJdn(hijriYearStartJdn(ah)),
};
