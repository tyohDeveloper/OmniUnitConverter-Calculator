import type { EraTable, EraTableEntry } from './types';

// Generic piecewise era-table lookup: given an astronomical CE year, find
// the era it falls in and the year count within that era (start year = 1).
// An entry's optional `epoch` overrides `start` as the year-counting origin.
// Returns null when the year predates the first era or exceeds `table.end`.
export function lookupEraTable(
  astro: number,
  table: EraTable,
): { eraName: string; eraYear: number; dynasty?: string } | null {
  if (table.end !== undefined && astro > table.end) return null;
  let match: EraTableEntry | null = null;
  for (const era of table.eras) {
    if (era.start <= astro && (!match || era.start > match.start)) match = era;
  }
  if (!match) return null;
  const origin = match.epoch ?? match.start;
  return { eraName: match.name, eraYear: astro - origin + 1, dynasty: match.dynasty };
}
