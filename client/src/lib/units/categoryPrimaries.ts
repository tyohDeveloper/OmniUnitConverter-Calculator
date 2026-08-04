import { CONVERSION_DATA } from '../conversion-data';

/**
 * Map from specialist category id to its declared primary category id.
 *
 * Built once at module load from CONVERSION_DATA. Categories with no
 * primaryCategory field are absent. Used by cross-domain match
 * filters and Direct-pane matching to skip specialists whose primary
 * would also match a given dimensional query.
 *
 * Loading order: this module top-level-imports CONVERSION_DATA, so
 * anything importing it here transitively loads all conversion data.
 * That's fine for the current consumers (findCross* helpers,
 * categoryDimensions.getMatchingPhysicalQuantities) since those live
 * downstream of CONVERSION_DATA in the dep graph.
 */
export const CATEGORY_PRIMARIES: Readonly<Record<string, string>> = (() => {
  const map: Record<string, string> = {};
  for (const cat of CONVERSION_DATA) {
    if (cat.primaryCategory) map[cat.id] = cat.primaryCategory;
  }
  return map;
})();
