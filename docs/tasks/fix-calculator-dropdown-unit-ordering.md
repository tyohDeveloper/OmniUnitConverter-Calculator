# Fix Calculator Dropdown Unit Ordering

## What & Why
The calculator result unit dropdown lists all compatible SI representations, but the ordering doesn't follow the cross-domain match structure. When a result has dimensions shared by multiple quantities (e.g., Energy, Torque, Photon all share J's dimensions), the dropdown should surface the default unit for each matched quantity first — in the same order the quantities are listed — followed by remaining units and the pure base unit last.

## Done looks like
- For a Joule-dimensioned result (Energy, Torque, Photon), the dropdown shows:
  1. J — the default unit for Energy
  2. N⋅m — the default unit for Torque
  3. The best available generated representation for Photon (or eV if it appears in the generated list)
  4. Any remaining generated representations
  5. The pure base unit (kg⋅m²⋅s⁻²) at the very bottom
- This ordering applies consistently across all cross-domain matched dimension signatures, not just the Joule case.
- The cross-domain matches text in parentheses (e.g., "(Energy, Torque, Photon)") keeps the same order that the dropdown entries follow.

## Out of scope
- Changes to conversion factors or values.
- Changes to the ConverterPane or any non-calculator UI.
- Adding new unit symbols not already in the generated list or SI derived catalog.

## Tasks
1. **Build a category → default display symbol mapping** — Create a static lookup (e.g., `CATEGORY_DEFAULT_SYMBOLS`) keyed by category ID → the default display symbol for that category's calculator representation. Source this from the first unit's symbol in each category's JSON data file. For categories whose default symbol does not appear in the generated SI representations (e.g., photon's `eV`), use the SI derived unit symbol for that category from `siDerivedUnitsCatalog` as the fallback, or the best-matching generated rep if no direct SI symbol exists.

2. **Reorder generated representations in `generateSIRepresentations`** — After the existing sort and promotion steps, apply a final reordering pass:
   - Phase 1: For each cross-domain matched category (in the order returned by `findCrossDomainMatches`), find the generated representation whose `displaySymbol` matches that category's default symbol and move it to the front. If no exact match exists, use the closest available generated rep for that category (matched by SI derived unit category field).
   - Phase 2: All remaining generated representations with depth > 0 (derived units), in their existing order.
   - Phase 3: Pure base unit representations (depth === 0) at the end.

3. **Update `findCrossDomainMatches` ordering** — Ensure the order of returned quantity names matches the order they will appear in the dropdown (i.e., determined by the same category ID ordering as `CATEGORY_DIMENSIONS`). Verify the ordering is stable and consistent with what the dropdown shows.

## Relevant files
- `client/src/lib/calculator/generateSIRepresentations.ts`
- `client/src/lib/calculator/findCrossDomainMatches.ts`
- `client/src/lib/calculator/siDerivedUnits.ts`
- `client/src/lib/units/siDerivedUnitsCatalog.ts`
- `client/src/lib/units/categoryDimensions.ts`
- `client/src/lib/units/preferredRepresentations.ts`
- `client/src/data/conversion/energy.json`
- `client/src/data/conversion/torque.json`
- `client/src/data/conversion/photon.json`
