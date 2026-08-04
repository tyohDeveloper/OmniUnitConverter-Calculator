import type { SIRepresentation } from './siRepresentation';
import { SI_DERIVED_UNITS } from '../units/siDerivedUnitsCatalog';

// Canonical-symbol OVERRIDES: torque has no SI-derived-unit entry;
// photon SI ν/λ overridden to eV. Other strict-match categories
// derive from data.
const CANONICAL_SYMBOL_OVERRIDES: Record<string, string> = {
  torque: 'N⋅m',
  photon: 'eV',
};

// Loose match branch (no synthesis on miss). Bare "rad"/"Bq"/"sr"
// rows would be misleading when the user views a composition that
// happens to share dimensions.
const LOOSE_MATCH_CATEGORIES = new Set(['angle', 'radioactivity', 'solid_angle']);

// Strict-match map: overrides ∪ SI_DERIVED_UNITS (first per category,
// minus loose set). Overrides win.
const STRICT_MATCH_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = { ...CANONICAL_SYMBOL_OVERRIDES };
  for (const u of SI_DERIVED_UNITS) {
    if (LOOSE_MATCH_CATEGORIES.has(u.category)) continue;
    if (map[u.category] != null) continue;
    map[u.category] = u.symbol;
  }
  return map;
})();

function strictMatch(
  reps: SIRepresentation[],
  usedIndices: Set<number>,
  canonicalSymbol: string,
): { foundIdx: number; rep: SIRepresentation } {
  const foundIdx = reps.findIndex(
    (r, i) => !usedIndices.has(i) && r.displaySymbol === canonicalSymbol,
  );
  if (foundIdx !== -1) return { foundIdx, rep: reps[foundIdx] };
  return { foundIdx: -1, rep: { displaySymbol: canonicalSymbol, derivedUnits: [], depth: 1 } };
}

function looseMatch(
  reps: SIRepresentation[],
  usedIndices: Set<number>,
  catKey: string,
): number {
  const siUnitsForCat = SI_DERIVED_UNITS.filter(u => u.category === catKey);
  for (const siUnit of siUnitsForCat) {
    const idx = reps.findIndex(
      (r, i) => !usedIndices.has(i) && r.derivedUnits?.includes(siUnit.symbol),
    );
    if (idx !== -1) return idx;
  }
  return -1;
}

/**
 * Resolve one cross-match category to a pull-or-synthesize result;
 * mutates usedIndices when it takes an existing rep from the list.
 * STRICT_MATCH_MAP membership decides the branch: strict-match-and-
 * synthesize (for categories that have a canonical symbol via
 * overrides or SI_DERIVED_UNITS), or loose-match-no-synthesis (for
 * angle/radioactivity/solid_angle). Returns undefined for loose-
 * branch misses.
 */
export function resolveCrossMatchForCategory(
  reps: SIRepresentation[],
  usedIndices: Set<number>,
  catKey: string,
): SIRepresentation | undefined {
  const strictSymbol = STRICT_MATCH_MAP[catKey];
  if (strictSymbol != null) {
    const { foundIdx, rep } = strictMatch(reps, usedIndices, strictSymbol);
    if (foundIdx !== -1) usedIndices.add(foundIdx);
    return rep;
  }
  const foundIdx = looseMatch(reps, usedIndices, catKey);
  if (foundIdx === -1) return undefined;
  usedIndices.add(foundIdx);
  return reps[foundIdx];
}
