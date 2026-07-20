import type { EraTable } from './types';

// Generic piecewise era-table lookup: given an astronomical CE year, find
// the era it falls in and the year count within that era (start year = 1).
// Returns null when the year predates the first era in the table.
export function lookupEraTable(
  astro: number,
  table: EraTable,
): { eraName: string; eraYear: number } | null {
  let match: { name: string; start: number } | null = null;
  for (const era of table.eras) {
    if (era.start <= astro && (!match || era.start > match.start)) match = era;
  }
  if (!match) return null;
  return { eraName: match.name, eraYear: astro - match.start + 1 };
}
