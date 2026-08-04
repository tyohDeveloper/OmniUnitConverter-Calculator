import type { SIRepresentation } from './siRepresentation';
import { countUnits } from '../unit-symbols/countUnits';
import { sumAbsExponents } from '../unit-symbols/sumAbsExponents';
import { SPECIALTY_DERIVED_UNITS } from '../unit-symbols/siDerivedUnits';

// Canonical comparator order (returns -1 / 1 / 0 per key, in
// precedence). Depth 0 (raw base-units) sinks to the bottom; ties
// broken by term count, then abs-exponent sum, then non-specialty
// before specialty, then alphabetical.
function compareRepresentations(a: SIRepresentation, b: SIRepresentation): number {
  if (a.depth === 0 && b.depth !== 0) return 1;
  if (a.depth !== 0 && b.depth === 0) return -1;
  const byUnits = countUnits(a.displaySymbol) - countUnits(b.displaySymbol);
  if (byUnits !== 0) return byUnits;
  const byExp = sumAbsExponents(a.displaySymbol) - sumAbsExponents(b.displaySymbol);
  if (byExp !== 0) return byExp;
  const aSpec = a.derivedUnits?.some(u => SPECIALTY_DERIVED_UNITS.has(u)) ?? false;
  const bSpec = b.derivedUnits?.some(u => SPECIALTY_DERIVED_UNITS.has(u)) ?? false;
  if (aSpec !== bSpec) return aSpec ? 1 : -1;
  return a.displaySymbol.localeCompare(b.displaySymbol);
}

/**
 * Sort the representation list in place with the canonical order used
 * by the SI-representations dropdown (see compareRepresentations).
 */
export function sortRepresentationsCanonical(reps: SIRepresentation[]): void {
  reps.sort(compareRepresentations);
}
