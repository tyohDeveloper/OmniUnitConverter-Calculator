import type { YearTable } from './types';
import { normalizeEraName } from './normalizeEraName';

export interface ConsulSuggestion {
  consuls: string;
  // Astronomical CE year (0 = 1 BCE) of the consulship.
  year: number;
  tableId: string;
}

// Filler words in natural phrases like "consulship of Caesar and Bibulus":
// dropped from the query so only the actual names have to match.
const STOPWORDS = new Set([
  'consulship', 'consuls', 'consul', 'of', 'and', 'the', 'in', 'year', '&',
]);

// Autocomplete over consul-pair names. Every whitespace-separated query token
// (after dropping filler words) must match the pair; pairs repeat across
// years (e.g. Pompeius & Crassus in 70 and 55 BCE), so all matching years are
// returned in chronological order. Entries where every token starts a word
// rank before substring-only matches.
export function searchConsulNames(
  query: string,
  tables: YearTable[],
  limit = 8,
): ConsulSuggestion[] {
  const tokens = normalizeEraName(query)
    .split(/\s+/)
    .filter(t => t.length > 0 && !STOPWORDS.has(t));
  if (tokens.length === 0) return [];
  const prefix: ConsulSuggestion[] = [];
  const substring: ConsulSuggestion[] = [];
  for (const table of tables) {
    for (let i = 0; i < table.consuls.length; i++) {
      const norm = normalizeEraName(table.consuls[i]);
      if (!tokens.every(tok => norm.includes(tok))) continue;
      const words = norm.split(/[^a-z0-9]+/);
      const allWordPrefix = tokens.every(tok => words.some(w => w.startsWith(tok)));
      const item = { consuls: table.consuls[i], year: table.start + i, tableId: table.id };
      (allWordPrefix ? prefix : substring).push(item);
    }
  }
  return [...prefix, ...substring].slice(0, limit);
}
