# Rename Caret to Karat in Unitless

## What & Why
The gold-fineness unit in the Unitless Numbers category is misspelled "Caret" (a caret is the ^ symbol). Rename its display name to "Karat" everywhere, matching its Wikipedia source URL (en.wikipedia.org/wiki/Karat).

## Done looks like
- The unit appears as "Karat" in the Unitless Numbers category (English UI).
- All 12 language translation files use the key "Karat" (translated values unchanged where already correct, e.g. de "Karat", fr "Carat").
- Generated unit reference docs show "Karat".
- Tests and translation-key integrity checks pass.

## Out of scope
- Changing the unit id (`caret`) or symbol unless required by key-hygiene guard tests — prefer updating symbol to `karat` for consistency, but keep the internal id stable if it risks breaking saved state.
- Any conversion factor changes (stays 1/24).

## Steps
1. Rename the unit's `name` (and symbol, if appropriate) from "Caret" to "Karat" in the unitless conversion data.
2. Rename the "Caret" translation key to "Karat" in all localization unit files (en, en-us, de, fr, es, it, pt, ru, ar, ja, ko, zh), preserving translated values.
3. Regenerate or update the docs/measures reference tables that list the unit.
4. Update the tests and confirm the json-integrity translation-key guard passes.

## Relevant files
- `client/src/data/conversion/unitless.json:94-102`
- `client/src/data/localization/units/en.json:378`
- `client/src/data/localization/units/en-us.json:78`
- `client/src/data/localization/units/de.json:370`
- `tests/unitless.test.ts:70`
- `docs/measures/units.md:669`
- `docs/measures/units-by-system.md:828`
- `docs/measures/compare-all.md:1029`
