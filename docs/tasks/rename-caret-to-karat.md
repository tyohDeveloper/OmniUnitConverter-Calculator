# Rename Caret to Karat in Unitless

## What & Why
The Unitless Numbers category contains a gold-fineness unit (factor 1/24) misspelled as "Caret" (a caret is the ^ symbol; a carat is the gemstone mass unit already present in Archaic Mass). This unit is the karat — the wiki source URL already points to the Karat page. Rename it correctly everywhere.

## Done looks like
- The unitless unit displays as "Karat" with symbol "kt", id `karat`, factor 1/24, unchanged source URL.
- No occurrence of "Caret"/"caret" remains in unit data, localization files, tests, or generated docs (the OTP UI component's caret cursor is unrelated and stays).
- All 12 language files translate "Karat" appropriately (most already have the correct karat/carat translation under the old key; just move them to the new key).
- The Archaic Mass "Carat (Metric)" unit is untouched.
- All tests, lint-size, typecheck, and verify-build pass.

## Out of scope
- Any change to "Carat (Metric)" in Archaic Mass.
- Adding new fineness-related units.

## Steps
1. **Rename the unit in unitless data** — change id `caret` → `karat`, name "Caret" → "Karat", symbol `caret` → `kt`; consider using a higher-precision 1/24 factor consistent with how other fractional factors are stored in this file.
2. **Update localization keys** — rename the "Caret" key to "Karat" in all 12 unit-translation files (en, en-us, ar, de, es, fr, it, ja, ko, pt, ru, zh), keeping the existing translated values which already mean karat. Ensure the translation-key hygiene guard test in json-integrity passes.
3. **Update tests** — adjust the unitless test that references `caret` to the new id, and any other references.
4. **Regenerate reference docs** — refresh docs/measures files (units.md, units-by-system.md, compare-all.md) so they show Karat instead of Caret.

## Relevant files
- `client/src/data/conversion/unitless.json:95-102`
- `client/src/data/localization/units/en.json:378`
- `client/src/data/localization/units/en-us.json:78`
- `tests/unitless.test.ts:70`
- `docs/measures/units.md:669`
