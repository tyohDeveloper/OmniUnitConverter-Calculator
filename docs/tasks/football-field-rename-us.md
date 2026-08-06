# Rename Football Field to (US)

## What & Why
Rename the existing "Football field" length unit in Archaic & Regional Length to "Football Field (US)" to clarify it's the American football field (100 yd = 91.44 m), consistent with the naming of the planned area unit.

## Done looks like
- The unit displays as "Football Field (US)" in the Archaic & Regional Length category.
- Conversions unchanged (still exactly 91.44 m).
- Localization files (all locales) use the updated key/name per the translation-key hygiene rules; guard tests pass.
- Generated unit reference docs reflect the new name.

## Out of scope
- The Football Field Area (US) unit (Task #186).
- Any factor or symbol changes.

## Steps
1. **Rename the unit** — Update the unit's name in the Archaic & Regional Length dataset to "Football Field (US)".
2. **Update localization** — Rename the corresponding key in all locale files under the units localization directory, keeping each locale's translation adjusted (e.g. adding "(US)" or the local equivalent).
3. **Update docs & verify** — Regenerate/update the units reference doc and run json-integrity, localization, and unit-catalog-contract tests.

## Relevant files
- `client/src/data/conversion/archaic_length.json:344`
- `client/src/data/localization/units/en.json`
- `client/src/data/localization/units/en-us.json`
- `docs/measures/units.md`
