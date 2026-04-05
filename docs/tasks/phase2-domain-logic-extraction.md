# Phase 2: Extract Pure Domain Logic

## What & Why
Break up the large logic files (`calculator.ts`, `conversion-data.ts`, `lib/units/helpers.ts`, and the logic portions of `unit-converter.tsx`) into single-function files of 20 lines or less. Each exported file contains exactly one exported function. Small helpers used by only one function remain local (nested) in that function's file. Helpers useful across multiple functions get their own file.

This is the core structural refactoring that enables independent unit testing of pure functions and reduces git conflicts to near zero for logic changes.

## Done looks like
- `client/src/lib/calculator.ts` is replaced by a `client/src/lib/calculator/` directory where each file exports one function (e.g., `parseDimension.ts`, `generateSIRepresentations.ts`, `applyRpnBinary.ts`, `dimensionMultiply.ts`, etc.)
- `client/src/lib/units/helpers.ts` is similarly decomposed into `client/src/lib/units/` single-function files
- Logic that was embedded in `unit-converter.tsx` (parsing, conversion wiring, prefix selection, formatting decisions) is extracted to pure functions in the appropriate domain directory
- No function body exceeds 20 lines; longer operations are composed from shorter named functions
- All pure functions have corresponding unit tests that run without a browser/app
- All characterization tests from Phase 1 continue to pass

## Out of scope
- Data structure splitting (that is Phase 3)
- State management changes (that is Phase 4)
- UI component decomposition (that is Phase 5)
- `localization.ts` logic (covered in Phase 3 alongside its data)

## Tasks
1. **Decompose `calculator.ts`** — Split each function into its own file under `lib/calculator/`. Functions over 20 lines are broken into composed smaller functions. Local helpers stay co-located. Export an `index.ts` for clean imports.
2. **Decompose `lib/units/helpers.ts`** — Same treatment: one exported function per file under `lib/units/`, with an `index.ts` barrel.
3. **Extract logic from `unit-converter.tsx`** — Pull all non-rendering logic (input parsing, unit resolution, conversion dispatch, prefix carry-over, paste handling) into pure functions in `lib/` or `features/unit-converter/domain/`. Leave the component file wiring-only for now.
4. **Write unit tests for all newly extracted functions** — Each pure function gets a test file covering its core cases and edge cases.

## Relevant files
- `client/src/lib/calculator.ts`
- `client/src/lib/units/helpers.ts`
- `client/src/lib/conversion-data.ts`
- `client/src/lib/units/shared-types.ts`
- `client/src/components/unit-converter.tsx`
- `client/src/components/unit-converter/hooks/useRpnStack.ts`
- `tests/calculator.test.ts`
- `tests/math.test.ts`
- `tests/rpn-calculator.test.ts`
- `tests/symbol-parsing.test.ts`
- `tests/conversion-edge-cases.test.ts`
- `tests/smart-paste.test.ts`
