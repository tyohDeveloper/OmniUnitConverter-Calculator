import type { EraTable, EraTableEntry } from './types';

// Start year of the era immediately following `entry` in the table,
// or null when `entry` is the latest era.
export function nextEraStart(entry: EraTableEntry, table: EraTable): number | null {
  let next: number | null = null;
  for (const e of table.eras) {
    if (e.start > entry.start && (next === null || e.start < next)) next = e.start;
  }
  return next;
}
