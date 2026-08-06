import { describe, it, expect } from 'vitest';
import { lookupUnitForSymbol } from '../client/src/lib/unit-symbols/lookupUnitForSymbol';
import { CONVERSION_DATA, isNonLinearUnit } from '../client/src/lib/conversion-data';

/**
 * Pin the "first-match-wins" behavior of lookupUnitForSymbol for
 * every symbol that appears in more than one category.
 *
 * lookupUnitForSymbol iterates CONVERSION_DATA in array order and
 * returns the first non-non-linear match. Fifty-five symbols today
 * are shared across two or more categories (mostly volume units
 * duplicated in `beer_wine_volume` and `cooking`, plus a few
 * cross-category symbols like `g-force` and `parsec`). Which
 * category "owns" a shared symbol is determined solely by the order
 * of imports in `client/src/lib/conversion-data.ts`.
 *
 * Reordering that array — a plausible refactor since the ordering
 * isn't currently expressed as a semantic priority — would silently
 * change which unit definition every downstream consumer sees when
 * asked about a shared symbol. That includes:
 *
 *   - Clipboard smart-paste (parses "1 J" and needs to decide which
 *     `J` — energy or photon).
 *   - Calculator display (siToDisplay / displayToSI branch on
 *     categoryId to know whether it's temperature/inverse/etc.).
 *   - RPN re-expression (reexpressRpnEntry looks up the unit).
 *   - Round-trip converters, comparison mode, and anything else
 *     that reads the returned categoryId.
 *
 * The expected mapping below is the source of truth for the
 * ordering-derived priority. Every entry is a design decision that
 * should be revisited deliberately, not by accident. To change a
 * winner:
 *
 *   1. Reorder the CONVERSION_DATA array in
 *      client/src/lib/conversion-data.ts so the desired category
 *      appears first.
 *   2. Update the corresponding entry in EXPECTED_WINNERS below.
 *   3. Audit every consumer that reads .categoryId from a
 *      lookupUnitForSymbol result and confirm the change is
 *      intentional for their use.
 */

// Ordering-derived winners as of 2026-08-05. Enumerated by
// tests/duplicateSymbolOrdering scripts (see git log for the audit
// that produced this table). Every value is the categoryId that
// CURRENTLY wins for the given symbol; a diff here means either a
// deliberate reorder (fine — update this table) or an accidental
// one (bug — fix the ordering).
const EXPECTED_WINNERS: Record<string, string> = {
  '%': 'concentration',
  'BTU': 'energy',
  'J': 'energy',
  'L': 'volume',
  'Pa': 'pressure',
  'W': 'power',
  'Wh': 'energy',
  'b': 'area',
  'bar': 'pressure',
  'bu': 'volume',
  'cal': 'energy',
  'ch': 'archaic_length',
  'cp': 'intensity',
  'cp (US)': 'volume',
  'd⁻¹': 'frequency',
  'eV': 'energy',
  'fl oz (US)': 'volume',
  'fl oz (imp)': 'volume',
  'ft': 'length',
  'ft\'in"': 'length',
  'ftm': 'archaic_length',
  'ft³': 'volume',
  'g': 'mass',
  // 'common' and 'gregorian' calendars both share the polyfill's
  // gregory backend id as their symbol. 'common' appears first in
  // date_calendar.json so it wins. Both hits are in the same
  // category so smart-paste behavior is unaffected — SYMBOLIC
  // categories are excluded from cross-category dimensional match
  // via CATEGORY_FAMILIES.
  'gregory': 'date_calendar',
  'g-force': 'acceleration',
  'gal (US)': 'volume',
  'gal (imp)': 'volume',
  'in': 'length',
  'jigger': 'archaic_volume',
  'kg': 'mass',
  'lm': 'luminous_flux',
  'm': 'length',
  'mL': 'archaic_volume',
  'm²': 'area',
  'm³': 'volume',
  'parsec': 'length',
  'pk': 'volume',
  'ppb': 'concentration',
  'ppm': 'concentration',
  'ppt': 'concentration',
  'pt (US)': 'volume',
  'pt (imp)': 'volume',
  'qt (US)': 'volume',
  'qt (imp)': 'volume',
  'rad⋅s⁻¹': 'frequency',
  'rd': 'archaic_length',
  'rpm': 'frequency',
  'rps': 'frequency',
  'tbsp (US)': 'volume',
  'tbsp (imp)': 'volume',
  'therm': 'energy',
  'tsp (US)': 'volume',
  'tsp (imp)': 'volume',
  'yd': 'length',
  'yd³': 'volume',
  '‰': 'concentration',
};

describe('lookupUnitForSymbol — duplicate-symbol ordering', () => {
  for (const [symbol, expectedCategory] of Object.entries(EXPECTED_WINNERS)) {
    it(`${JSON.stringify(symbol)} resolves to ${expectedCategory}`, () => {
      const result = lookupUnitForSymbol(symbol);
      expect(result, `${symbol} must be found`).not.toBeNull();
      expect(result!.categoryId).toBe(expectedCategory);
    });
  }

  it('the expected-winners table matches the actual duplicate set (no drift)', () => {
    // If CONVERSION_DATA adds new duplicate symbols (e.g. a new category
    // that reuses an existing unit symbol) the table above needs to grow.
    // This meta-test enumerates the true set of linear duplicates at
    // runtime and asserts it equals the keys of EXPECTED_WINNERS. On
    // failure, add the missing symbols to the table (and re-audit which
    // category should win).
    const symbolsByCategory: Array<{ symbol: string; category: string }> = [];
    for (const category of CONVERSION_DATA) {
      for (const unit of category.units) {
        if (isNonLinearUnit(unit)) continue;
        symbolsByCategory.push({ symbol: unit.symbol, category: category.id });
      }
    }

    const seenIn = new Map<string, string[]>();
    for (const { symbol, category } of symbolsByCategory) {
      if (!seenIn.has(symbol)) seenIn.set(symbol, []);
      seenIn.get(symbol)!.push(category);
    }
    const actualDuplicates = new Set(
      Array.from(seenIn.entries()).filter(([_, cats]) => cats.length > 1).map(([sym]) => sym),
    );
    const expectedDuplicates = new Set(Object.keys(EXPECTED_WINNERS));

    const missingFromTable = Array.from(actualDuplicates).filter(s => !expectedDuplicates.has(s));
    const staleInTable = Array.from(expectedDuplicates).filter(s => !actualDuplicates.has(s));

    expect(missingFromTable, `new duplicate symbols not in EXPECTED_WINNERS: ${missingFromTable.join(', ')}`).toEqual([]);
    expect(staleInTable, `EXPECTED_WINNERS entries that are no longer duplicates: ${staleInTable.join(', ')}`).toEqual([]);
  });
});
