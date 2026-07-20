import type { EraTable } from './types';
import { lookupEraTable } from './lookupEraTable';
import { normalizeEraName } from './normalizeEraName';
import { nextEraStart } from './nextEraStart';

// Inverse era-table lookup: era name (diacritic-insensitive) + year count
// within the era → astronomical CE year. Returns null when the name is not
// in the table or the year count falls outside the era's span (validated by
// round-tripping through the forward lookup). Japanese nengō change mid-year,
// so an era's final year overlaps the next era's start year (Meiji 45 = 1912
// = Taishō 1); Chinese niánhào change at New Year, so no overlap is allowed.
export function reverseLookupEraTable(
  eraName: string,
  eraYear: number,
  table: EraTable,
): number | null {
  if (!Number.isInteger(eraYear) || eraYear < 1) return null;
  const wanted = normalizeEraName(eraName);
  const entry = table.eras.find(e => e.name === eraName)
    ?? table.eras.find(e => normalizeEraName(e.name) === wanted);
  if (!entry) return null;
  const origin = entry.epoch ?? entry.start;
  const astro = origin + eraYear - 1;
  if (table.end !== undefined && astro > table.end) return null;
  const forward = lookupEraTable(astro, table);
  if (forward && forward.eraName === entry.name) return astro;
  // Mid-year overlap (main nengō line and Southern Court table alike).
  return table.id.startsWith('japanese') && astro === nextEraStart(entry, table)
    ? astro
    : null;
}
