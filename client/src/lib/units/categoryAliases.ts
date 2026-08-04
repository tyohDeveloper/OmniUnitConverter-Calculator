import { CONVERSION_DATA } from '../conversion-data';

/**
 * Set of category ids with hideFromDirectMatch=true.
 *
 * Aliases share dimensions with a more-familiar primary but represent
 * semantically distinct concepts (radioactivity vs frequency,
 * cross_section vs area, sound_pressure vs pressure, etc.). They
 * should not surface in Direct-pane matching or the SI-representations
 * dropdown when the user has built dimensions freehand, even though
 * their dimensions match.
 *
 * Built once at module load from CONVERSION_DATA. Same loading-order
 * pattern as categoryPrimaries and categoryFamilies.
 */
export const CATEGORY_DIRECT_MATCH_HIDDEN: ReadonlySet<string> = (() => {
  const set = new Set<string>();
  for (const cat of CONVERSION_DATA) {
    if (cat.hideFromDirectMatch) set.add(cat.id);
  }
  return set;
})();
