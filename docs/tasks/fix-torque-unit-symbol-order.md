# Fix derived unit symbol ordering in calculator

## What & Why
In the calculator's unit result dropdown, composed symbols show the remaining base-dimension symbols *before* the named derived-unit symbol — e.g. `m⋅N` instead of `N⋅m`, or similar inversions for other quantities. This is because `formatSIComposition` places the remaining base-dimension string ahead of the named derived unit. The converter pane is unaffected (it reads symbols directly from the JSON data files where they are correctly ordered). Only the display label ordering in the calculator-generated symbols needs to change; no conversion logic should be touched.

## Done looks like
- In the calculator, composed unit symbols in the result dropdown show the named derived unit first, followed by remaining base dimensions (e.g. `N⋅m`, `J⋅s`, `W⋅m`, etc.), matching the order shown in the entry/conversion pane.
- This is consistent across all quantities, not just torque.
- No conversion results change in value.

## Out of scope
- Changes to any conversion factor or formula.
- Changes to the converter pane (ConverterPane.tsx) — it is already correct.

## Tasks
1. **Reorder parts in `formatSIComposition`** — Move the `derivedSymbols` to be joined before `positiveBase` (the remaining positive base-dimension string), so the named derived unit always comes first in the composed symbol, for all quantities.

## Relevant files
- `client/src/lib/calculator/formatSIComposition.ts`
- `client/src/lib/calculator/generateSIRepresentations.ts`
- `client/src/lib/units/preferredRepresentations.ts`
