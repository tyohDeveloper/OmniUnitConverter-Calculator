# Show Physical Quantity in Custom Entry Tab

## What & Why
When a user sets unit exponents in the Custom Entry (Direct) tab, display the name(s) of the physical quantity those dimensions correspond to — e.g. "Energy / Torque" for kg·m²·s⁻². This gives immediate feedback without leaving the tab.

## Done looks like
- As soon as the exponent combination matches one or more known physical quantities, a label appears near the unit display showing all matching names, e.g. "Energy / Torque".
- If multiple qualities match, all are shown (separated by " / ").
- Archaic, local, and domain-specific alias categories are excluded from matching (see below).
- If no non-excluded category matches, the label is hidden.
- The label updates live as the user changes exponents.

## Exclusion rules
Filter out the following categories from the match results:

1. Everything already in `EXCLUDED_CROSS_DOMAIN_CATEGORIES` (archaic lengths/masses/volumes/areas/energy/power, typography, cooking, beer & wine, fuel, fuel economy, lightbulb, rack geometry, shipping, data, math).
2. Domain-specific physics aliases that duplicate a more general quantity under the same dimensions:
   - `radioactivity`, `radioactive_decay` (alias for Frequency)
   - `radiation_dose`, `absorbed_dose`, `equivalent_dose` (alias for Specific Energy / Kinematic Viscosity)
   - `cross_section` (alias for Area)
   - `photon` (alias for Energy)
   - `sound_pressure` (alias for Pressure)
   - `sound_intensity` (alias for Power / Surface Tension context)
   - `acoustic_impedance` (domain alias)
   - `refractive_power` (domain alias)
   - `fuel` (alias for Energy)

Implement the exclusion list as a constant alongside or extending `EXCLUDED_CROSS_DOMAIN_CATEGORIES` in `categoryDimensions.ts`.

## Out of scope
- Changing any existing category dimensions or adding new categories.
- Showing the label anywhere outside the Custom Entry tab.
- Any changes to the RPN calculator stack or converter pane.

## Tasks
1. Extend (or create a companion constant to) `EXCLUDED_CROSS_DOMAIN_CATEGORIES` in `categoryDimensions.ts` to also include the domain-specific alias categories listed above.
2. Add a utility function that takes a `DimensionalFormula` and returns matching quality names, skipping all excluded categories.
3. In `DirectPane`, call the utility on every render using the current `buildDirectDimensions()` result and display all matching names in a small label near the unit symbol. Hide the label when there are no matches.

## Relevant files
- `client/src/lib/units/categoryDimensions.ts`
- `client/src/lib/units/dimensionalFormula.ts`
- `client/src/features/unit-converter/components/DirectPane.tsx`
