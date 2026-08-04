import type { SIRepresentation } from './siRepresentation';
import { resolveCrossMatchForCategory } from './crossMatchLookup';

/**
 * Reorder a representation list so cross-domain match categories come
 * first, in the order the match keys were reported. Uses
 * resolveCrossMatchForCategory to pull or synthesize a rep per
 * category; remaining reps go to phase2 (depth != 0, derived-unit
 * compositions) then phase3 (depth === 0, raw base-units), preserving
 * original order. Mutates the input array in place.
 */
export function applyCrossDomainOrdering(
  reps: SIRepresentation[],
  crossMatchKeys: string[],
): void {
  const usedIndices = new Set<number>();
  const phase1: SIRepresentation[] = [];
  for (const catKey of crossMatchKeys) {
    const rep = resolveCrossMatchForCategory(reps, usedIndices, catKey);
    if (rep) phase1.push(rep);
  }
  const phase2: SIRepresentation[] = [];
  const phase3: SIRepresentation[] = [];
  for (let i = 0; i < reps.length; i++) {
    if (usedIndices.has(i)) continue;
    (reps[i].depth === 0 ? phase3 : phase2).push(reps[i]);
  }
  reps.splice(0, reps.length, ...phase1, ...phase2, ...phase3);
}
