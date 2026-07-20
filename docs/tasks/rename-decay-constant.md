# Clarify Decay Constant Unit Name

## What & Why
In the Radioactive Decay category, the unit "Per Day (λ)" is confusing — it reads like a half-life of one day, but it is actually the decay constant λ expressed per day. Rename it to something self-explanatory, e.g. "Decay Constant (λ, per day)".

## Done looks like
- The unit shows as "Decay Constant (λ, per day)" (or equivalent clear wording) in the converter, comparison mode, and the Sources page
- All 12 languages show a proper translation of the new name (standard symbol d⁻¹ unchanged)
- No conversion factors change; all tests, typecheck, lint-size, and build checks pass

## Out of scope
- Any changes to half-life or mean-lifetime units
- Any changes to conversion math

## Steps
1. **Rename the unit** — Update the display name in the radioactive decay data file (symbol d⁻¹ stays the same).
2. **Add translations** — Add the new English name and its translation to each of the 12 unit-name localization files (currently the old name has no translation entries, so add them keyed by the new English name).
3. **Verify** — Update any tests referencing the old name and run the full test, typecheck, lint-size, and verify-build workflows.

## Relevant files
- `client/src/data/conversion/radioactive_decay.json:7-15`
- `client/src/data/localization/units/en.json`
- `client/src/data/localization/units/de.json`
- `client/src/lib/translateUnit.ts`
