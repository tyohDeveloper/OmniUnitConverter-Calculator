# Smart Paste: symbol match before decompose

## What & Why
When a user enters a compound unit like `N*m` or `ft·lb`, the parser currently detects it as a dimensional formula and decomposes it to base dimensions (`M¹L²T⁻²`). Because Energy and Torque share identical base dimensions and Energy is listed first in the data, the result routes to Energy — even though `N·m` and `ft·lb` are unambiguously torque units.

The fix is to attempt a direct symbol lookup against all known units (across all categories) **before** falling back to dimensional decomposition. If the normalised compound string matches a registered unit symbol exactly, use that unit's category directly. Only proceed to dimensional decomposition when no direct symbol match is found.

## Done looks like
- Typing or pasting `N*m`, `N·m`, or `N⋅m` in Smart Paste or Custom Entry routes to Torque, not Energy.
- Typing or pasting `ft·lb`, `ft*lb`, or `ft-lb` routes to Torque.
- Typing or pasting `ft·lbf` (foot-pound-force) routes to Torque.
- Pure energy symbols (`J`, `kJ`, `kcal`, `eV`, etc.) still route to Energy as before.
- Dimensional strings with no direct symbol match (`kg·m²/s²`) still fall back to the existing dimensional decomposition path (showing both Energy and Torque as options).

## Out of scope
- Changing how ambiguous dimension-only strings are resolved (that is an existing design choice).
- Altering the torque or energy unit catalogs themselves.
- Changing unit display order in dropdowns.

## Tasks
1. **Normalise-and-lookup helper** — Write a function that normalises a raw compound unit string (replacing `*`, `·`, `⋅`, `×`, `-` between unit tokens with a canonical separator) and checks it against the full symbol map built by `buildUnitSymbolMap` across all categories. Return the matched category and unit if found.

2. **Wire into the parsing path** — In `parseUnitText` (and/or `parseDimensionalFormula`), call the helper before invoking dimensional decomposition. If the helper returns a match, short-circuit and return that result. Only continue to dimensional decomposition if no symbol match is found.

3. **Cover routing callsites** — Ensure both the Smart Paste handler in `UnitConverterApp.tsx` and the Direct/Custom Entry pane in `DirectPane.tsx` benefit from the early-exit. No separate fix should be needed if the change is made in the shared parsing layer, but verify both paths work correctly.

## Relevant files
- `client/src/lib/conversion-data.ts`
- `client/src/data/conversion/torque.json`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
- `client/src/features/unit-converter/components/DirectPane.tsx`
- `client/src/lib/units/categoryDimensions.ts`
