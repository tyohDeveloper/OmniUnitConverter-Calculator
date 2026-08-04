# Unitless Numbers Category

## What & Why
Add a new conversion category **"Unitless Numbers"** to the **Other** group. It collects dimensionless ratios and counting quantities (percent, dozen, lakh, mole, etc.) that all convert as simple multiples of a base value of **1**. These are not SI units and must not appear as directly selectable cross-domain alternates in the calculator's alternate-units selector.

## Done looks like
- A new "Unitless Numbers" category appears under the **Other** group in the sidebar, fully translated in all 12 languages.
- Selecting it shows the unit list below, with the base unit first and all other units sorted ascending by magnitude.
- Conversions work by simple multiplication (value × factor), e.g. `1 dozen = 12`, `5 % = 0.05`, `1 myriad = 10000`.
- The category and its units never appear as cross-domain alternates in the calculator alternate-units selector.
- Build, typecheck, lint-size, and tests all pass.

## Out of scope
- Logarithmic / power-based units. **Skip these entirely** (they require special functions and add complexity per the request): **Decibel (dB)**, **Bel (B)**, **Neper (neper)**, **pH**.
- Any change to existing categories.

## Unit list (base = 1, then sorted ascending by size)
Capitalization normalized to Title Case (matching existing data conventions). Base unit listed first; everything else sorted by factor ascending.

| Name | Symbol | Factor | Notes |
|---|---|---|---|
| Number | `1` | 1 | Base unit (the "absolute"/default = 1). Not SI. |
| Parts Per Trillion | `ppt` | 1e-12 | |
| Parts Per Billion | `ppb` | 1e-9 | |
| Parts Per Million | `ppm` | 1e-6 | |
| Permyriad | `‱` | 1e-4 | |
| Basis Point | `bp` | 1e-4 | Same value as permyriad, distinct symbol. |
| Permille | `‰` | 1e-3 | |
| Proof (US) | `proof (US)` | 0.005 | 100 proof = 50% ABV. |
| Proof (Imperial) | `proof (imp)` | 0.005715 | 100 proof ≈ 57.15% ABV. |
| Percent | `%` | 0.01 | |
| Alcohol by Volume | `abv` | 0.01 | Same value as percent, distinct symbol. |
| Caret | `caret` | 0.0416666667 | = 1/24 (gold-fineness sense, confirmed by user). |
| Fold | `fold` | 1 | n-fold = n×. |
| Golden Ratio | `φ` | 1.6180339887 | |
| Pair | `pair` | 2 | |
| Couple | `couple` | 2 | |
| Brace | `brace` | 2 | |
| Euler's Number | `e` | 2.7182818285 | |
| Hat-Trick | `hat-trick` | 3 | |
| Pi | `π` | 3.1415926536 | |
| Half Dozen | `half-doz` | 6 | |
| Decade | `decade` | 10 | |
| Dozen | `doz` | 12 | |
| Baker's Dozen | `bakers-doz` | 13 | |
| Score | `score` | 20 | |
| Century | `century` | 100 | |
| Long Hundred | `long-hundred` | 120 | |
| Gross | `gross` | 144 | |
| Great Gross | `great-gross` | 1728 | |
| Myriad | `myriad` | 10000 | |
| Wan | `万` | 10000 | Chinese myriad; same value as myriad. |
| Lakh | `लाख` | 100000 | |
| Crore | `करोड़` | 10000000 | |
| Mole | `mole` | 6.02214076e23 | Avogadro count. Use symbol `mole` (NOT `mol`) to avoid colliding with the amount-of-substance base unit. |

## Symbol-uniqueness requirement (critical)
The request explicitly asks that symbols be correct and unique. Symbols must be unique **within** this category AND must not collide with existing global symbols in the app's symbol map (used by parsing / smart paste).
- Build the global unit symbol map (`buildUnitSymbolMap`) and verify each new symbol does not clash with a higher-priority existing unit. In particular check: `e`, `π`, `φ`, `%`, `mole`/`mol`, `B` (skipped anyway).
- If a collision is found, pick a sensible distinct symbol and note the change. `mole` is already chosen over `mol` for this reason.
- The base unit symbol `1` is a placeholder — if it conflicts or renders poorly, choose a clear distinct alternative (e.g. `×1` or `num`) consistent with the app's display conventions.

## Steps
1. **Create the category data file** — Add `client/src/data/conversion/unitless.json` mirroring the structure of an existing dimensionless category (e.g. `data.json`): `id: "unitless"`, `name: "Unitless Numbers"`, `baseUnit: "Number"`, and the `units` array above. These are NOT SI: do not use `unitType: "SI_BASE"`, do not set `allowPrefixes: true`, and set `measurementSystem` to a non-SI value (e.g. `"DIMENSIONLESS"`, or omit it). Order entries: base unit first, then all others ascending by factor.

2. **Register the category** — In `client/src/lib/conversion-data.ts`: import the JSON, add `'unitless'` to the `UnitCategory` union type, add the imported object to the `CONVERSION_DATA` array, and add `unitless: {}` (dimensionless) to `CATEGORY_DIMENSION_MAP`.

3. **Add to the Other group** — In `client/src/features/unit-converter/app/UnitConverterApp.tsx`, add `'unitless'` to the `categories` array of the `Other` entry in `CATEGORY_GROUPS`.

4. **Dimensions + calculator exclusion** — In `client/src/lib/units/categoryDimensions.ts`: add `unitless: { name: 'Unitless Numbers', dimensions: {}, isBase: false }` to `CATEGORY_DIMENSIONS`, and add `'unitless'` to `EXCLUDED_CROSS_DOMAIN_CATEGORIES` so it is never offered as a directly selectable cross-domain alternate in the calculator.

5. **Verify symbol uniqueness** — Per the "Symbol-uniqueness requirement" section above, confirm no clashes against the global symbol map and adjust any conflicting symbol, documenting the change.

6. **Localization (all 12 languages)** — Add the category display name `"Unitless Numbers"` to every file in `client/src/data/localization/ui/` (`ar, de, en-us, en, es, fr, it, ja, ko, pt, ru, zh`). Add every new unit name to every file in `client/src/data/localization/units/`. Translate names where it makes sense (Percent, Permille, Dozen, Pair, Golden Ratio, Euler's Number, Pi, Mole, etc.); for proper-noun / culture-specific counts (Lakh, Crore, Wan) keep the romanized name or its local-script equivalent as appropriate per language. Keep symbols unchanged across languages.

7. **Tests** — Add/extend unit tests to cover representative conversions in the new category (e.g. percent, dozen, baker's dozen, myriad, lakh, crore, mole, caret, both proofs), and confirm the category is excluded from calculator cross-domain alternates. Ensure existing localization-coverage tests still pass for all 12 languages.

8. **Validate** — Run typecheck, lint-size, tests, and verify-build; fix any failures.

## Relevant files
- `client/src/data/conversion/data.json`
- `client/src/data/conversion/cooking.json`
- `client/src/lib/conversion-data.ts:72-145,286-357,459-507`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx:26-35`
- `client/src/lib/units/categoryDimensions.ts:9-104`
- `client/src/data/localization/ui/`
- `client/src/data/localization/units/`
