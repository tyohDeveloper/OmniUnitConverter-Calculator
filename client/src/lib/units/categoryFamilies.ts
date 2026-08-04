import { CONVERSION_DATA } from '../conversion-data';
import type { CategoryFamily } from './unitDefinition';

/**
 * Map from category id to its declared family.
 *
 * Built once at module load from CONVERSION_DATA. Every category
 * declares a required family field; the map is total (defined for
 * every id that has a JSON file).
 *
 * Ghost entries in CATEGORY_DIMENSIONS that lack JSON files (math,
 * absorbed_dose) are NOT present in this map. Consumers that guard
 * on family must handle undefined for those cases (typically by
 * treating them as if they were the most-restrictive family).
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

