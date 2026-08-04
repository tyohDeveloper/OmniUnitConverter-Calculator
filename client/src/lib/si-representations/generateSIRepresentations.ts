import type { DimensionalFormula } from '../units/dimensionalFormula';
import type { SIRepresentation } from './siRepresentation';
import { isDimensionEmpty } from '../dimensions/isDimensionEmpty';
import { formatDimensions } from '../unit-symbols/formatDimensions';
import { countUnits } from '../unit-symbols/countUnits';
import { isValidSymbolRepresentation } from '../unit-symbols/isValidSymbolRepresentation';
import { findCrossDomainMatches } from './findCrossDomainMatches';
import { findCrossDomainMatchesByKey } from './findCrossDomainMatchesByKey';
import { buildDerivedCompositions } from './buildDerivedCompositions';
import { filterByBaseTermCount } from './filterByBaseTermCount';
import { sortRepresentationsCanonical } from './sortRepresentationsCanonical';
import { buildCategoryUnitsForDropdown } from './buildCategoryUnitsForDropdown';
import { applyCrossDomainOrdering } from './applyCrossDomainOrdering';
import { promotePerfectSIMatch } from './promotePerfectSIMatch';
import { applyPreferredRepresentation } from './applyPreferredRepresentation';

/**
 * Build the ordered "SI representations" list for a dimensional
 * formula: derived-unit compositions (kg·m/s², N·m, ...), the raw
 * base-unit form, and matching catalog units. Output ordering:
 *
 *   1. Perfect-SI-match rep promoted to front (promotePerfectSIMatch).
 *   2. Hand-curated PREFERRED_REPRESENTATIONS override
 *      (applyPreferredRepresentation).
 *   3. Cross-domain match categories pulled to top in match order
 *      (applyCrossDomainOrdering).
 *   4. Remaining derived compositions sorted by term count, exponent
 *      sum, specialty flag, then alphabetical (sortRepresentationsCanonical).
 *   5. Raw base-units row (depth 0) at the tail.
 *   6. Catalog category units appended (buildCategoryUnitsForDropdown).
 *
 * `sourceCategory` narrows the appended catalog units to that
 * category. The two `_`-prefixed legacy parameters are kept for
 * signature compatibility; internal impl uses canonical helpers.
 */
export const generateSIRepresentations = (
  dimensions: DimensionalFormula,
  _getDimensionSignature?: (dims: DimensionalFormula) => string,
  _PREFERRED?: Record<string, { displaySymbol: string; isSI: boolean }>,
  sourceCategory?: string,
): SIRepresentation[] => {
  if (isDimensionEmpty(dimensions)) {
    return [{ displaySymbol: '1', derivedUnits: [], depth: 0 }];
  }

  const seenSymbols = new Set<string>();
  const representations = buildDerivedCompositions(dimensions, seenSymbols);

  const rawSymbol = formatDimensions(dimensions);
  if (rawSymbol && !seenSymbols.has(rawSymbol) && isValidSymbolRepresentation(rawSymbol)) {
    representations.push({ displaySymbol: rawSymbol, derivedUnits: [], depth: 0 });
  }

  const baseTermCount = rawSymbol ? countUnits(rawSymbol) : 0;
  const filteredRepresentations = filterByBaseTermCount(representations, baseTermCount);
  sortRepresentationsCanonical(filteredRepresentations);

  promotePerfectSIMatch(filteredRepresentations);
  applyPreferredRepresentation(filteredRepresentations, dimensions);

  const crossMatchKeys = findCrossDomainMatchesByKey(dimensions);
  if (crossMatchKeys.length > 0) {
    applyCrossDomainOrdering(filteredRepresentations, crossMatchKeys);
  }

  const crossMatches = findCrossDomainMatches(dimensions);
  if (crossMatches.length > 0) {
    for (const rep of filteredRepresentations) rep.crossDomainMatches = crossMatches;
  }

  const allSeenSymbols = new Set(filteredRepresentations.map(r => r.displaySymbol));
  const categoryUnits = buildCategoryUnitsForDropdown(dimensions, allSeenSymbols, sourceCategory);
  if (crossMatches.length > 0) {
    for (const rep of categoryUnits) rep.crossDomainMatches = crossMatches;
  }
  filteredRepresentations.push(...categoryUnits);

  return filteredRepresentations;
};
