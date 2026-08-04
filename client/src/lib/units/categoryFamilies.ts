import { CONVERSION_DATA } from '../conversion-data';
import type { CategoryFamily } from './unitDefinition';

/**
 * Map from category id to its declared family.
 *
 * Built once at module load from CONVERSION_DATA. Every category
 * declares a required family field; the map is total (defined for
 * every id that has a JSON file).
 *
 * No ghost entries remain in CATEGORY_DIMENSIONS. Every id in
 * CATEGORY_DIMENSIONS has a corresponding JSON file in
 * data/conversion/ and thus a registered family. If a future ghost
 * (dimension-declared category with no JSON) is added, consumers
 * guarding on family should treat undefined as 'not SI_QUANTITY' to
 * preserve exclusion behavior.
 *
 * Loading order mirrors categoryPrimaries: this module lives
 * downstream of CONVERSION_DATA, and nothing that conversion-data
 * imports transitively imports this file.
 */
export const CATEGORY_FAMILIES: Readonly<Record<string, CategoryFamily>> = (() => {
  const map: Record<string, CategoryFamily> = {};
  for (const cat of CONVERSION_DATA) {
    map[cat.id] = cat.family;
  }
  return map;
})();

