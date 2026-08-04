import type { SIRepresentation } from './siRepresentation';
import { countUnits } from '../unit-symbols/countUnits';

/**
 * Filter the representation list to drop derived-unit compositions
 * that are longer (by term count) than the raw base-units symbol.
 * A depth-0 rep (the raw form) always passes; depth-1+ reps pass
 * only if their term count is <= the base term count. When the base
 * count is 0 (dimensionless-ish), no filtering.
 */
export function filterByBaseTermCount(
  reps: SIRepresentation[],
  baseTermCount: number,
): SIRepresentation[] {
  if (baseTermCount === 0) return reps;
  return reps.filter(rep => rep.depth === 0 || countUnits(rep.displaySymbol) <= baseTermCount);
}
