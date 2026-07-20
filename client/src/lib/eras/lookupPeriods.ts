import type { Civilization, HistoricalPeriod } from './types';
import { historicalYearToAstronomical } from './historicalYearToAstronomical';

// Given an astronomical CE year, return the matching period (if any) per
// civilization. Period bounds are stored as signed historical years
// (negative = BCE, no year zero) and are approximate ("ca.").
export function lookupPeriods(
  astro: number,
  civilizations: Civilization[],
): Array<{ civilization: Civilization; period: HistoricalPeriod | null }> {
  return civilizations.map((civilization) => {
    const period = civilization.periods.find((p) =>
      astro >= historicalYearToAstronomical(p.start) &&
      astro <= historicalYearToAstronomical(p.end)
    ) ?? null;
    return { civilization, period };
  });
}
