# Fuel Energy Unit Polish

## What & Why
Several display and naming issues in the Fuel Energy quantity need fixing: long unit symbols wrap in the Compare All panel, kerosene/paraffin and gasoline/petrol names show both regional variants at once instead of being locale-driven, kerosene symbol abbreviations are inconsistent across SI vs common unit bases, and units in the Compare All list are grouped by measurement type rather than by fuel type (making it hard to find all jet fuel units at a glance).

## Done looks like
- Compare All panel: unit symbol column is wide enough that no fuel energy symbol wraps to a second line.
- With locale set to `en`: kerosene units display as "Paraffin" (e.g. "Pound of Paraffin"), gasoline units display as "Petrol" (e.g. "Litre of Petrol").
- With locale set to `en-us`: kerosene units display as "Kerosene", gasoline units display as "Gasoline".
- Kerosene/Paraffin symbols: `lb (karo)` and `gal (karo)` for common-measure units; `L (para)` and `kg (para)` for SI-measure units.
- Gallon-based fuel units keep their existing `(US)` suffix in the name; pound-based units have no `(US)` suffix (already correct — verify and leave untouched).
- In the Compare All panel and unit dropdowns for Fuel Energy, units appear clustered by fuel type: all jet fuel variants together (lb, gal, L, kg), all kerosene/paraffin variants together, all gasoline/petrol variants together, etc. General energy units (J, cal, BTU, Wh) and explosive/equivalent units (TNT, dynamite, TOE, TCE) remain in natural positions at the top/bottom.

## Out of scope
- Localization of any units outside the Fuel Energy quantity.
- Changing the symbol column width in any display other than Compare All.
- Adding new fuel energy units.
- Any changes to the RPN stack or calculator behaviour.

## Tasks
1. **Widen the Compare All symbol column** — Increase the fixed width of the symbol `<span>` in the comparison row from `w-12` to a value wide enough to prevent wrapping for the longest fuel energy symbols (e.g. `w-24` or measured to fit `gal (ethanol)`).

2. **Locale-driven names for kerosene/paraffin and gasoline/petrol** — Add translation entries to `unit-name-translations.json` for every kerosene (Paraffin) and gasoline (Petrol) unit name, mapping the existing canonical name (e.g. `"Pound of Kerosene (Paraffin)"`) to locale-specific display strings: `en` → "Pound of Paraffin", `en-us` → "Pound of Kerosene". Apply the same pattern to all four measure variants (lb, gal, L, kg) for each fuel type. No changes to fuel.json names are required.

3. **Fix kerosene/paraffin symbol abbreviations** — In `fuel.json`, update the `symbol` field for the four kerosene units: common-measure units (`lb_kerosene`, `gal_kerosene`) use `lb (karo)` / `gal (karo)`; SI units (`l_kerosene`, `kg_kerosene`) use `L (para)` / `kg (para)`. Leave all other fuel symbols unchanged.

4. **Cluster fuel types together in fuel.json** — Reorder the unit entries in `fuel.json` so that all variants of each fuel type appear contiguously (e.g. lb/gal/L/kg jet fuel together, then lb/gal/L/kg kerosene together, etc.). Keep standard energy units (J, cal, BTU, Wh, therm) and explosive/equivalent units (TNT, dynamite, TCE, TOE) in their natural positions. No code changes are needed — only entry order in the JSON file.

## Relevant files
- `client/src/data/conversion/fuel.json`
- `client/src/data/localization/unit-name-translations.json`
- `client/src/features/unit-converter/components/ConverterPane.tsx:511-523`
- `client/src/lib/translateUnit.ts`
