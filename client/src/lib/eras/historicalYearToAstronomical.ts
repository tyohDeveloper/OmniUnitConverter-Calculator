// Signed historical year (negative = BCE, no year zero) → astronomical CE
// year (year 0 = 1 BCE): 100 BCE (−100) → −99; 100 CE (100) → 100.
export function historicalYearToAstronomical(year: number): number {
  return year < 0 ? year + 1 : year;
}
