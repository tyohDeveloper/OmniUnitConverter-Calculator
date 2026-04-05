# Structural Module Split & Import Cleanup

## What & Why
`shared-types.ts` and `types.ts` bundle multiple independent concerns into single files, and `helpers.ts` / `calculator.ts` act as opaque barrels that cause consumers to import everything when they only need a subset. The same constants (`CATEGORY_DIMENSIONS`, `PREFERRED_REPRESENTATIONS`, `SI_DERIVED_UNITS`, `EXCLUDED_CROSS_DOMAIN_CATEGORIES`) also exist duplicated across the `units/` and `calculator/` directories. The goal is one concern per file, each module importing only what it actually needs, and a single source of truth for shared constants.

## Done looks like
- `shared-types.ts` is split into individual files, each owning one cohesive concern (dimensional formula types, SI base unit constants and mappings, SI derived units catalog, non-SI units catalog, category dimension constants, language/format types, preferred representations, `getDimensionSignature`)
- `types.ts` is split into individual files (`UnitCategory`, `Prefix`, `UnitDefinition`/`CategoryDefinition`)
- All ~35 files previously importing from `shared-types.ts`, and all files importing from `types.ts`, are updated to import from the new individual files
- `CATEGORY_DIMENSIONS`, `PREFERRED_REPRESENTATIONS`, `SI_DERIVED_UNITS`, and `EXCLUDED_CROSS_DOMAIN_CATEGORIES` have a single canonical source; the `calculator/` copies import from there rather than maintaining their own definitions
- `helpers.ts` consumers (`UnitConverterApp.tsx`, `ConverterPane.tsx`) import directly from individual source files; `helpers.ts` is removed or reduced to only the test surface for `helpers-functions.test.ts`
- `CalculatorPane.tsx` and `ConverterPane.tsx` import directly from source files rather than through the `calculator.ts` barrel
- `findOptimalPrefix` is extracted out of `prefixes.ts` into its own file; the prefix data (`PREFIXES`, `BINARY_PREFIXES`, `ALL_PREFIXES`) stays together
- `index.ts` is updated to re-export from the new split files
- Temporary compatibility re-exports are used on `index.ts` during migration so no callsites break mid-way; they are removed before the task is complete
- `UnitConverterApp.tsx` is migrated last (highest blast radius)
- Build, typecheck, and full test suite pass with no behaviour changes

## Out of scope
- Any logic or runtime behaviour changes
- Localization changes (`applyRegionalSpelling` cleanup is Task B)
- Removal of `findBestPrefix` (Task B)
- Refactoring `normalizeMassDisplay` internals (Task B)
- Further splitting `calculator/siDerivedUnits.ts` (deferred pending post-migration assessment)

## Tasks
1. **Define ownership map** — For each duplicated symbol (`CATEGORY_DIMENSIONS`, `PREFERRED_REPRESENTATIONS`, `SI_DERIVED_UNITS`, `EXCLUDED_CROSS_DOMAIN_CATEGORIES`), decide its single canonical home in the new file structure before any files are moved.

2. **Split `units/shared-types.ts`** — Move each independent concern into its own file within `client/src/lib/units/`. Add temporary compatibility re-exports to `index.ts` so existing import paths continue to resolve during migration.

3. **Split `units/types.ts`** — Separate `UnitCategory`, `Prefix`, and `UnitDefinition`/`CategoryDefinition` into individual files.

4. **Resolve duplicates** — Update `calculator/categoryDimensions.ts`, `calculator/siDerivedUnits.ts`, and `calculator/generateSIRepresentations.ts` to import their shared constants from the new canonical source files rather than maintaining local copies.

5. **Extract `findOptimalPrefix`** — Move it out of `prefixes.ts` into its own file; leave the prefix data in `prefixes.ts`.

6. **Migrate calculator internals** — Update all files within `client/src/lib/calculator/` to import from the new split files.

7. **Migrate unit helpers and smaller consumers** — Update `client/src/lib/units/` helper files, `CalculatorPane.tsx`, and `ConverterPane.tsx` to import directly from source files rather than barrels.

8. **Clean up `helpers.ts`** — Update `UnitConverterApp.tsx` imports to use source files directly. Remove `helpers.ts` or reduce it to only what `helpers-functions.test.ts` explicitly tests.

9. **Migrate `UnitConverterApp.tsx`** — Update this highest-blast-radius consumer last, once all new module exports are stable.

10. **Update `index.ts` and remove compatibility shims** — Finalize `index.ts` re-exports to reference new split files, and remove any temporary compatibility exports added during migration.

11. **Verify** — Confirm typecheck, build, and full test suite (including characterization, shared-types, calculator, and localization tests) all pass with no behaviour changes.

## Relevant files
- `client/src/lib/units/shared-types.ts`
- `client/src/lib/units/types.ts`
- `client/src/lib/units/helpers.ts`
- `client/src/lib/units/index.ts`
- `client/src/lib/units/prefixes.ts`
- `client/src/lib/units/buildDimensionalSymbol.ts`
- `client/src/lib/units/normalizeMassUnit.ts`
- `client/src/lib/units/normalizeMassDisplay.ts`
- `client/src/lib/units/applyPrefixToKgUnit.ts`
- `client/src/lib/calculator.ts`
- `client/src/lib/calculator/types.ts`
- `client/src/lib/calculator/index.ts`
- `client/src/lib/calculator/categoryDimensions.ts`
- `client/src/lib/calculator/siDerivedUnits.ts`
- `client/src/lib/calculator/generateSIRepresentations.ts`
- `client/src/lib/calculator/applyRpnBinary.ts`
- `client/src/lib/calculator/applyRpnUnary.ts`
- `client/src/lib/calculator/buildDirectDimensions.ts`
- `client/src/lib/calculator/canApplyDerivedUnit.ts`
- `client/src/lib/calculator/canFactorOut.ts`
- `client/src/lib/calculator/dimensionsEqual.ts`
- `client/src/lib/calculator/divideDimensions.ts`
- `client/src/lib/calculator/findCrossDomainMatches.ts`
- `client/src/lib/calculator/findDerivedUnitPower.ts`
- `client/src/lib/calculator/formatDimensions.ts`
- `client/src/lib/calculator/formatSIComposition.ts`
- `client/src/lib/calculator/generateAlternativeRepresentations.ts`
- `client/src/lib/calculator/getDerivedUnit.ts`
- `client/src/lib/calculator/hasOnlyOriginalDimensions.ts`
- `client/src/lib/calculator/isDimensionEmpty.ts`
- `client/src/lib/calculator/isDimensionless.ts`
- `client/src/lib/calculator/isRadians.ts`
- `client/src/lib/calculator/isValidSIComposition.ts`
- `client/src/lib/calculator/multiplyDimensions.ts`
- `client/src/lib/calculator/normalizeDimensions.ts`
- `client/src/lib/calculator/subtractDerivedUnit.ts`
- `client/src/lib/calculator/subtractDimensions.ts`
- `client/src/lib/calculator/canAddSubtract.ts`
- `client/src/lib/formatting.ts`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
- `client/src/features/unit-converter/components/ConverterPane.tsx`
- `client/src/features/unit-converter/components/CalculatorPane.tsx`
- `client/src/components/unit-converter/components/CalculatorFieldDisplay.tsx`
- `client/src/components/unit-converter/state/calculatorReducer.ts`
- `client/src/components/unit-converter/state/rpnReducer.ts`
- `client/src/components/unit-converter/state/converterReducer.ts`
- `client/src/components/unit-converter/state/actions/saveAndUpdateStack.ts`
- `client/src/components/unit-converter/state/actions/setCalcValues.ts`
- `client/src/components/unit-converter/state/actions/setLastX.ts`
- `client/src/components/unit-converter/state/actions/setPreviousRpnStack.ts`
- `client/src/components/unit-converter/state/actions/setRpnStack.ts`
- `client/src/components/unit-converter/state/actions/updateCalcValues.ts`
- `client/src/components/unit-converter/state/actions/updateRpnStack.ts`
- `client/src/components/unit-converter/state/actions/pushValue.ts`
- `client/src/components/unit-converter/state/actions/setResultCategory.ts`
- `client/src/components/unit-converter/state/actions/setActiveCategory.ts`
- `client/src/components/unit-converter/hooks/useCalculatorState.ts`
- `client/src/components/unit-converter/hooks/useRpnStack.ts`
- `client/src/components/unit-converter/hooks/useConverterState.ts`
- `client/src/lib/units/prefixExponents.ts`
- `client/src/lib/units/findBestPrefix.ts`
- `tests/helpers-functions.test.ts`
- `tests/characterization.test.ts`
- `tests/reducers.test.ts`
- `tests/hooks.test.ts`
- `tests/calculator-functions.test.ts`
- `tests/shared-types.test.ts`
