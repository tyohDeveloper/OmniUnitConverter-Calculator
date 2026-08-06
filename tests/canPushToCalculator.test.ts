import { describe, it, expect } from 'vitest';
import { canPushToCalculator } from '../client/src/lib/calculator/canPushToCalculator';
import { CATEGORY_FAMILIES } from '../client/src/lib/units/categoryFamilies';

/**
 * Gate for pushing values from the converter into the calculator/RPN
 * stack. The calculator is 100% numeric — SYMBOLIC-family categories
 * must be silently rejected at the push sites rather than requiring
 * per-family branches in every calculator-side handler.
 */
describe('canPushToCalculator', () => {
  it('returns true for undefined source (direct-pane pushes carry no category)', () => {
    expect(canPushToCalculator(undefined)).toBe(true);
  });

  it('returns true for SI_QUANTITY categories', () => {
    // Sanity: pick a category that exists and is SI_QUANTITY. `length`
    // is the canonical example.
    expect(CATEGORY_FAMILIES.length).toBe('SI_QUANTITY');
    expect(canPushToCalculator('length')).toBe(true);
  });

  it('returns true for DIMENSIONLESS_RATIO categories', () => {
    // Any DIMENSIONLESS_RATIO category — probe the registry rather
    // than hard-coding a name that could be renamed later.
    const dimlessId = Object.entries(CATEGORY_FAMILIES).find(([, f]) => f === 'DIMENSIONLESS_RATIO')?.[0];
    if (dimlessId) {
      expect(canPushToCalculator(dimlessId)).toBe(true);
    }
  });

  it('returns true for DATA_QUANTITY categories', () => {
    const dataId = Object.entries(CATEGORY_FAMILIES).find(([, f]) => f === 'DATA_QUANTITY')?.[0];
    if (dataId) {
      expect(canPushToCalculator(dataId)).toBe(true);
    }
  });

  it('returns true for NUMERIC_FUNCTION categories', () => {
    const nfId = Object.entries(CATEGORY_FAMILIES).find(([, f]) => f === 'NUMERIC_FUNCTION')?.[0];
    if (nfId) {
      expect(canPushToCalculator(nfId)).toBe(true);
    }
  });

  it('returns true for FUEL_ECONOMY categories', () => {
    const feId = Object.entries(CATEGORY_FAMILIES).find(([, f]) => f === 'FUEL_ECONOMY')?.[0];
    if (feId) {
      expect(canPushToCalculator(feId)).toBe(true);
    }
  });

  it('returns false for SYMBOLIC categories', () => {
    // At the time this test is written no SYMBOLIC category has been
    // registered in CONVERSION_DATA yet — the family exists as a
    // placeholder (commit b111ef8). Once Time/Date land, this test
    // will exercise the registry entries; for now it verifies the
    // gate's behavior when a SYMBOLIC id is fed in.
    //
    // Look for one; if there isn't one yet, exercise the gate with a
    // synthetic category-lookup that has no registry entry (undefined
    // family) to confirm the default-permissive branch.
    const symId = Object.entries(CATEGORY_FAMILIES).find(([, f]) => f === 'SYMBOLIC')?.[0];
    if (symId) {
      expect(canPushToCalculator(symId)).toBe(false);
    }
    // Sanity: unknown category id (no registry entry, family is undefined
    // → strictly not === 'SYMBOLIC' → gate permits). This matches the
    // documented behavior for ghost entries.
    expect(canPushToCalculator('nonexistent-category-id')).toBe(true);
  });

  it('automatically covers future SYMBOLIC categories with no code changes', () => {
    // Contract test: every SYMBOLIC-family category in the registry is
    // rejected. Guards against the gate silently drifting away from the
    // family declaration if someone adds a SYMBOLIC category later.
    const symbolicIds = Object.entries(CATEGORY_FAMILIES)
      .filter(([, family]) => family === 'SYMBOLIC')
      .map(([id]) => id);
    for (const id of symbolicIds) {
      expect(canPushToCalculator(id)).toBe(false);
    }
  });
});
