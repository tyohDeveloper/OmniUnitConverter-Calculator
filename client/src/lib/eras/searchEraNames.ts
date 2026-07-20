import type { EraTable } from './types';
import { normalizeEraName } from './normalizeEraName';

export interface EraNameSuggestion {
  name: string;
  native?: string;
  tableId: string;
  tableName: string;
  dynasty?: string;
  start: number;
}

// Autocomplete over era names across the given tables. Prefix matches rank
// before substring matches; ties break by table order then era start year.
export function searchEraNames(
  query: string,
  tables: EraTable[],
  limit = 8,
): EraNameSuggestion[] {
  const q = normalizeEraName(query);
  if (q.length === 0) return [];
  const prefix: EraNameSuggestion[] = [];
  const substring: EraNameSuggestion[] = [];
  for (const table of tables) {
    for (const era of table.eras) {
      const norm = normalizeEraName(era.name);
      const item = {
        name: era.name, native: era.native, tableId: table.id, tableName: table.name,
        dynasty: era.dynasty, start: era.start,
      };
      if (norm.startsWith(q)) prefix.push(item);
      else if (norm.includes(q)) substring.push(item);
    }
  }
  return [...prefix, ...substring].slice(0, limit);
}
