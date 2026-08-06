# Football Field Area (US) unit

## What & Why
Add a "Football Field Area (US)" unit to the Archaic & Regional Area category, so users can convert areas to/from the informal American "football fields" comparison unit.

## Done looks like
- "Football Field Area (US)" appears in the Archaic & Regional Area category and converts correctly (1 field = 360 ft × 160 ft including end zones = 57,600 sq ft = 5,351.215104 m²; cite an authoritative source such as the NFL rulebook or Wikipedia "American football field").
- Unit works in the converter and unit-aware calculator like any other area unit.
- All localization/integrity/catalog guard tests pass.

## Out of scope
- Other novelty comparison areas (soccer pitch, tennis court, etc.)
- Any changes to non-area categories.

## Steps
1. **Add the unit entry** — Append the unit to the Archaic & Regional Area data set with id, name, symbol (e.g. "ftbl fld"), factor 5351.215104, US measurement system, and a source URL, following the file's existing conventions.
2. **Localization keys** — Add the unit name to en.json (and other locale files as the project's key-hygiene rules require) so the translation-key guard test passes.
3. **Verify** — Run json-integrity, unit-catalog-contract, duplicate-symbol, and conversion tests; confirm the unit converts correctly (e.g. 1 field ≈ 1.3223 acres).

## Relevant files
- `client/src/data/conversion/archaic_area.json`
- `client/src/data/localization/ui/en.json`
- `tests/json-integrity.test.ts`
- `tests/unit-catalog-contract.test.ts`
