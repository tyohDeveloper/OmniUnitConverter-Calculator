# Complete length-based units in Area & Volume

## What & Why
The Area and Volume converters should offer the full set of standard length-based units: square/cubic inch, foot, and meter. Area already has in², ft², and m²; Volume has ft³ and m³ but is missing **Cubic Inch (in³)**. Meter-based units must keep SI prefix support, since the meter (not the liter) is the SI base for these dimensions.

## Done looks like
- Volume converter lists Cubic Inch (in³) with the exact factor 0.000016387064 m³, alongside the existing Cubic Foot, Cubic Yard, and Cubic Meter.
- Cubic Inch has localized names in all 12 language files (unit names are keyed by English name, e.g. "Cubic Inch").
- Square Meter and Cubic Meter continue to support SI prefixes, and prefixed conversions are dimensionally correct (1 km² = 1,000,000 m²; 1 km³ = 1,000,000,000 m³ — prefix factor squared/cubed, not linear). If verification finds linear prefix application for area/volume, fix it.
- Smart Paste recognizes "in³" / "cubic inch" input and routes it to the Volume tab.
- Existing tests pass; new unit-conversion tests cover cubic inch and prefixed m²/m³ round trips.

## Out of scope
- Archaic area/volume categories (separate JSON files, unchanged).
- Beer & wine volume category.
- Adding square yard/mile or other units already present.
- Changing the liter or any other existing unit definitions.

## Steps
1. **Add Cubic Inch to volume data** — Insert the in³ unit into the volume category JSON, ordered by factor among the other units, with US_COMMON / US_CUSTOMARY classification consistent with Cubic Foot.

2. **Verify prefix dimensionality for m² and m³** — Confirm that SI prefixes applied to Square Meter and Cubic Meter produce squared/cubed factors (km², cm³, etc.). Fix the prefix handling if it applies linear factors to these units.

3. **Localization** — Add "Cubic Inch" translations to all 12 unit-name localization files, following the existing English-name-key convention and British/American variant handling if applicable.

4. **Tests** — Add Vitest coverage for cubic inch conversions (in³ ↔ ft³ ↔ m³ ↔ L) and prefixed square/cubic meter correctness; run the existing suite to confirm nothing regresses.

## Relevant files
- `client/src/data/conversion/volume.json`
- `client/src/data/conversion/area.json`
- `client/src/lib/units/prefixExponents.ts`
- `client/src/lib/units/prefixes.ts`
- `client/src/lib/conversion-data.ts:558-630`
- `client/src/data/localization/units/en.json`
