# Calculator Unit Dropdown: All Non-Archaic Units

## What & Why
The calculator result unit dropdown only shows SI and SI-derived representations (e.g. `m²`, `J`, `N`). Quantities that happen to have a named SI unit (energy → `J`, force → `N`, power → `W`) work fine. But quantities without one — area, volume, speed, length, density, etc. — only show the raw SI form (e.g. just `m²`). The user expects all relevant non-excluded equivalent units (ft², ac, km/h, mph, L, gal, knots, ha, lb/ft³, etc.) to be offered.

Root cause: `generateSIRepresentations()` is the sole source for the dropdown. It pulls from `GENERAL_SI_DERIVED` and `siDerivedUnits`. The separately-existing `generateAlternativeRepresentations()` (which uses `NON_SI_UNITS_CATALOG`) is never wired into the calculator dropdown. Furthermore, `NON_SI_UNITS_CATALOG` is sparse — it only covers a handful of units — while the full set of needed units already exists in `CONVERSION_DATA` per-category.

## Done looks like
- Selecting area in the calculator (e.g. `1 m × 1 m`) shows SI representations first (m²) **plus** all included area units: ft², in², yd², ac, ha, etc. in the dropdown.
- Speed (e.g. `1 m / 1 s`) shows m/s plus km/h, mph, knots, ft/s, etc.
- Volume shows m³ plus L, mL, gal, fl oz, ft³, in³, etc.
- Length shows m plus ft, in, mi, yd, etc.
- Energy continues to work as before (J, erg, cal, BTU, etc.).
- Units from excluded categories do **not** appear in the dropdown.
- The SI representations (m², J, N, etc.) remain first in the list; additional units follow in a logical order.
- No duplicate symbols appear in the dropdown.

## Out of scope
- Changing the converter pane (only the calculator result dropdown is affected).
- Adding units that are not already in CONVERSION_DATA.
- Prefix selector behaviour changes.

## Tasks
1. **Define the exclusion list** — Create (or extend) a `EXCLUDED_DROPDOWN_CATEGORIES` constant covering all three excluded groups:
   - **Archaic & Regional**: `archaic_length`, `archaic_mass`, `archaic_volume`, `archaic_area`, `archaic_energy`, `archaic_power`
   - **Other** (UI group): `math`, `data`, `fuel`, `fuel_economy`, `rack_geometry`, `shipping`, `beer_wine_volume`, `lightbulb`
   - **Local/Regional specialty**: `cooking`, `typography`

2. **Build a `buildCategoryUnitsForDropdown` helper** — Given a `DimensionalFormula`, find all CONVERSION_DATA categories (not in the exclusion list above) whose dimensions match, then collect every unit from those categories (excluding math-function units and symbols already seen). Return them as `SIRepresentation`-compatible objects (depth: 2, derivedUnits: []).

3. **Wire the helper into `generateSIRepresentations`** — After the existing SI representations are assembled, call the new helper and append its results, deduplicating by symbol using the same `seenSymbols` set.

4. **Verify ordering** — SI/SI-derived reps remain at the top (existing sort/promote logic unchanged). CONVERSION_DATA units appear afterward, ordered by their position in each category's unit list (already curated from most-common to least-common in the JSON files).

## Relevant files
- `client/src/lib/calculator/generateSIRepresentations.ts`
- `client/src/lib/calculator/generateAlternativeRepresentations.ts`
- `client/src/lib/calculator/categoryDimensions.ts`
- `client/src/lib/calculator/types.ts`
- `client/src/lib/units/nonSiUnitsCatalog.ts`
- `client/src/lib/units/categoryDimensions.ts`
- `client/src/lib/conversion-data.ts`
- `client/src/features/unit-converter/components/CalculatorPane.tsx`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx:195-204`
