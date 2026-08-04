import { CONVERSION_DATA } from '../conversion-data';
import type { CategoryFamily } from './unitDefinition';

/**
 * Map from category id to its declared family.
 *
 * Built once at module load from CONVERSION_DATA. Every category
 * declares a required family field; the map is total (defined for
 * every id that has a JSON file).
 *
 * Ghost entries in CATEGORY_DIMENSIONS without JSON files (currently
 * luminous_exitance, pending implementation) are NOT in this map.
 * Consumers guarding on family treat undefined as 'not SI_QUANTITY',
 * preserving the exclusion behavior the old hardcoded lists provided.
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

