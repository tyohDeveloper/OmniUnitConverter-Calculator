import type { RulerRegion, Ruler } from './types';
import { historicalYearToAstronomical } from './historicalYearToAstronomical';

// Given an astronomical CE year, return the ruler(s) reigning in that year
// within a region (multiple = overlaps/co-regencies, e.g. Maya concurrent
// kings). If none reign and the year falls in an explicit gap, return the
// gap's note key. Reign bounds are signed historical years.
export function lookupRulers(
  astro: number,
  region: RulerRegion,
): { rulers: Ruler[]; gapNote: string | null } {
  const inSpan = (start: number, end: number) =>
    astro >= historicalYearToAstronomical(start) &&
    astro <= historicalYearToAstronomical(end);
  const rulers: Ruler[] = [];
  for (const dynasty of region.dynasties) {
    for (const r of dynasty.rulers) {
      if (inSpan(r.start, r.end)) rulers.push(r);
    }
  }
  if (rulers.length > 0) return { rulers, gapNote: null };
  const gap = (region.gaps ?? []).find((g) => inSpan(g.start, g.end)) ?? null;
  return { rulers, gapNote: gap ? gap.note : null };
}
