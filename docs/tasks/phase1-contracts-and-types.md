# Phase 1: Stabilize Contracts & Types

## What & Why
Unify shared types and constants into a single canonical source of truth, and add characterization tests that lock in current behavior. This prevents silent divergence during later phases and provides a safety net for all subsequent refactoring.

The architect identified that `DimensionalFormula`, `CalcValue`, `SI_DERIVED_UNITS`, and related types are already duplicated between `lib/calculator.ts` and `lib/units/shared-types.ts`. This must be resolved before any further splitting is done.

## Done looks like
- All shared types, interfaces, and constants are defined in exactly one place (`lib/units/shared-types.ts` or a clearly named canonical module)
- All other files import from the canonical source; no duplicate type definitions remain
- A characterization test file exists for each major behavior area (conversion, RPN, localization, formatting) that documents current outputs for known inputs — these tests all pass
- All existing tests continue to pass

## Out of scope
- Any logic changes or behavior changes
- Splitting functions or data structures (that is Phase 2 and 3)
- UI changes

## Tasks
1. **Audit and consolidate shared types** — Find all duplicate type/interface/constant definitions across `lib/calculator.ts`, `lib/units/shared-types.ts`, `lib/units/helpers.ts`, and `lib/conversion-data.ts`. Move all to `lib/units/shared-types.ts` and update all imports.
2. **Add characterization tests** — Write snapshot/fixture-style unit tests for the current behavior of `convertValue`, `parseUnitText`, `translate`, `formatValue`, and the RPN stack operations. These serve as a regression guard for all subsequent phases.
3. **Verify build and all existing tests pass** — Run the full test suite and confirm the single-file HTML build still produces a valid output.

## Relevant files
- `client/src/lib/units/shared-types.ts`
- `client/src/lib/calculator.ts`
- `client/src/lib/units/helpers.ts`
- `client/src/lib/conversion-data.ts`
- `client/src/lib/localization.ts`
- `client/src/lib/formatting.ts`
- `tests/calculator.test.ts`
- `tests/conversion.test.ts`
- `tests/localization.test.ts`
- `tests/formatting.test.ts`
- `vite.config.ts`
