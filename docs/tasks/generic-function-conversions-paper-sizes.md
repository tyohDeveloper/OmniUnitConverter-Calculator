# Generic function-based conversions + exact paper sizes

## What & Why
The conversion engine currently supports only multiplicative factors (plus special-cased temperature offsets, inverse units, and one-way math functions in the math category). Add a generic, reusable mechanism for function-based unit conversions: a unit may declare a named pair of functions (to-base and from-base) drawn from a code-side function registry, so JSON stays data-only. Then use this to make paper sizes exact: converting between A/B/JIS sizes yields exact sheet-count ratios (2 A1 = 1 A0, 4 A2 = 1 A0), with sizes derived by the standard's floor(previous/√2) rule on millimetre dimensions rather than hand-typed approximate area factors.

## Done looks like
- Converting A0 → A1 shows exactly 2; A0 → A2 shows exactly 4; same for B and JIS B series (within their own series).
- Round-trip conversions through function-based units return the original value (for invertible pairs).
- The mechanism is generic: any category's JSON can reference a registered function pair by name, with Zod validation rejecting unknown names or missing inverses.
- The existing math category's one-way functions keep working unchanged.
- Comparison mode, smart paste, and the calculator either work correctly with function-based units or explicitly exclude non-linear ones (matching how math-function units are excluded today), never producing silently wrong results.
- All existing tests pass; new tests cover the registry, paper-size exactness, and round-trips.
- Single-file HTML build still succeeds; size impact should be a few KB at most.

## Out of scope
- Migrating temperature or inverse (photon) units onto the new mechanism (they keep their existing special cases).
- Arbitrary user-entered formulas at runtime — functions are code-defined and referenced by name only.
- Cross-domain dimensional analysis for paper sizes (stays excluded as today).
- UI changes beyond correct numbers.

## Steps
1. **Function registry** — Create a small registry module of named conversion function pairs (toBase, fromBase, plus a flag for non-invertible/one-way functions). Extend the unit definition type and Zod schema so a unit JSON can reference a pair by name; validate at load that referenced names exist.

2. **Engine integration** — Extend the convert pipeline so toBaseValue/fromBaseValue dispatch to the registered pair when present, keeping the pure-factor fast path untouched. Preserve prefix handling semantics and refactor the existing math-category one-way path to fit the same registry shape without behavior change.

3. **Consumer audit** — Review comparison mode, smart paste symbol/name maps, prefix auto-switching, SI representations, and the unit-aware calculator for places that assume linear factors; make function-based units behave correctly there or exclude them the same way mathFunction units are excluded today.

4. **Paper sizes on exact math** — Rework the paper-sizes data to use the new mechanism with sheet-count semantics: derive each size from the ISO floor(previous/√2) mm rule so within-series ratios are exact powers of 2, and cross-series/US conversions use the floor-derived mm areas. Document the semantics choice (sheet count within a series, mm-derived area across series) in the data or code comments.

5. **Tests & build verification** — Add Vitest coverage for the registry (unknown name rejection, round-trip invertibility), exact paper-size ratios (A0→A1 === 2 etc.), and regression tests that math and temperature categories are unchanged. Run lint-size, typecheck, full test suite, and verify-build.

## Relevant files
- `client/src/lib/conversion-data.ts:364-410`
- `client/src/lib/units/unitDefinition.ts`
- `client/src/data/conversion/paper_sizes.json`
- `client/src/lib/calculator/lookupUnitForSymbol.ts`
- `client/src/lib/calculator/generateSIRepresentations.ts`
- `tests/json-integrity.test.ts`
- `tests/precision-comparison.test.ts`
- `tests/math.test.ts`
