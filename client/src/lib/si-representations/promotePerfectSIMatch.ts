import type { SIRepresentation } from './siRepresentation';
import { SI_DERIVED_UNITS } from '../units/siDerivedUnitsCatalog';

/**
 * If a "perfect SI match" exists in the representation list — a row
 * whose display symbol equals its single derived-unit symbol, and
 * that symbol is a canonical SI derived unit — move it to the front.
 *
 * Example: for pressure dimensions, if the list contains a rep
 * `{ displaySymbol: "Pa", derivedUnits: ["Pa"], depth: 1 }`, that
 * rep is the canonical form and should appear first regardless of
 * the sort order used to produce the list.
 *
 * Mutates in place. No-op when there's no such rep or when it's
 * already at index 0.
 */
export function promotePerfectSIMatch(reps: SIRepresentation[]): void {
  const idx = reps.findIndex(rep =>
    rep.derivedUnits.length === 1 &&
    rep.displaySymbol === rep.derivedUnits[0] &&
    SI_DERIVED_UNITS.some(u => u.symbol === rep.derivedUnits[0]),
  );
  if (idx > 0) {
    const [match] = reps.splice(idx, 1);
    reps.unshift(match);
  }
}
