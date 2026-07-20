import type { YearTable } from './types';

// Consular dating is per-year (a pair of eponymous consuls per year), unlike
// multi-year era tables, so it uses a direct array index instead of a
// piecewise boundary search. Returns null outside the attested range.
export function lookupRomanConsuls(
  astro: number,
  table: YearTable,
): string | null {
  if (!Number.isInteger(astro)) return null;
  if (astro < table.start || astro > table.end) return null;
  return table.consuls[astro - table.start] ?? null;
}
