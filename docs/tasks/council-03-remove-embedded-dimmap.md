# Externalize Category-Dimension Data (Delete Embedded dimMaps)

> **Source.** Generated from the model-council architecture pass in `docs/perplexity/`. See [architecture-pass-council-synthesis.md](../perplexity/architecture-pass-council-synthesis.md) and [architecture-standards.md](../perplexity/architecture-standards.md).
> **Priority.** P0. Violates both "logic in the pure layer" and "data external to code".
> **Standards reference.** §1.5 (data external), §5.1–§5.3 (single source of truth per fact).

## What & Why
Two files hard-code ~60-entry category → dimensional-formula tables that duplicate each other and duplicate the canonical catalog at `client/src/lib/units/categoryDimensions.ts`:

- `client/src/components/unit-converter/hooks/useCalculatorController.ts:296-338` — the `dimMap` object literal inside `pullFromPane`.
- `client/src/components/unit-converter/hooks/useConverterController.ts:118-160` — a second copy for a different code path.

The lib version `CATEGORY_DIMENSIONS` in `categoryDimensions.ts` is the intended source of truth. This is a "same data in three places" defect: any new category or corrected formula would need three synchronized edits.

## Done looks like
- Both embedded `dimMap` object literals are deleted.
- `CATEGORY_DIMENSIONS` from `lib/units/categoryDimensions.ts` is imported and used at both call sites.
- The catalog is moved out of TypeScript into JSON at `client/src/data/conversion/category-dimensions.json` with a Zod schema and a thin loader in `lib/units/categoryDimensions.ts` that reads it. The loader is the only export of that file.
- `tests/json-integrity.test.ts` gains a check that every id in `CONVERSION_DATA` has a matching entry in `category-dimensions.json` and vice versa.
- All existing tests pass.

## Out of scope
- Refactoring `pullFromPane` further (that logic still contains other issues covered in council-08).
- Moving other data-in-code tables (see council-13).

## Tasks
1. **Confirm equivalence.** Diff the three tables and note any discrepancies. Any discrepancy is a bug that must be resolved before this task lands.
2. **Move data to JSON.** Copy the resolved catalog into `client/src/data/conversion/category-dimensions.json`. Add a Zod schema in `lib/units/categoryDimensionsSchema.ts` (single-export, ≤100 lines).
3. **Rewrite the loader.** `lib/units/categoryDimensions.ts` becomes a small function that imports the JSON, validates once, and exports the map.
4. **Update both call sites.** `useCalculatorController.ts:296-338` and `useConverterController.ts:118-160` replace inline literals with `import { CATEGORY_DIMENSIONS } from '@/lib/units/categoryDimensions'`.
5. **Extend tests.** `tests/json-integrity.test.ts` covers the round-trip. `tests/hooks.test.ts` sanity-checks that `pullFromPane` returns the same values as before the move.

## Relevant files
- `client/src/components/unit-converter/hooks/useCalculatorController.ts`
- `client/src/components/unit-converter/hooks/useConverterController.ts`
- `client/src/lib/units/categoryDimensions.ts`
- `client/src/data/conversion/category-dimensions.json` (new)
- `tests/json-integrity.test.ts`
- `tests/hooks.test.ts`
