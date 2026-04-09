---
title: Unit name qualification fixes
---
# Unit Name Qualification Fixes

## What & Why
Six unit names are either ambiguous (same base name as another unit with a different value) or carry an incorrect system qualifier. Fixing these ensures users can distinguish between genuinely different units and that qualifiers accurately reflect the measurement system.

## Done looks like
- "Ounce" displays as "Ounce (Avoirdupois)" throughout the app
- "Pound" displays as "Pound (Avoirdupois)" throughout the app
- "Horsepower" displays as "Horsepower (Mechanical)" throughout the app
- "BTU" displays as "BTU (IT)" throughout the app
- "Therm" displays as "Therm (US)" throughout the app, with its factor corrected to 105480400 J
- "Pennyweight (Imperial)" displays as "Pennyweight (Troy)" throughout the app
- All 11 language localization files have their lookup keys updated to match the new names (translated values are preserved)

## Out of scope
- Adding the EC Therm as a separate unit
- Any other unit renames not listed above
- Changing conversion factor values other than Therm

## Tasks
1. **Rename units in data files** — Update the `name` field for all 6 units across `mass.json`, `power.json`, `energy.json`, and `archaic_mass.json`. Also correct the Therm factor from 105506000 to 105480400.
2. **Update localization keys** — In all 11 language files (`en.json`, `en-us.json`, `de.json`, `fr.json`, `es.json`, `pt.json`, `it.json`, `ru.json`, `zh.json`, `ja.json`, `ko.json`, `ar.json`), rename the lookup keys to match the new unit names while preserving existing translated values.

## Relevant files
- `client/src/data/conversion/mass.json`
- `client/src/data/conversion/power.json`
- `client/src/data/conversion/energy.json`
- `client/src/data/conversion/archaic_mass.json`
- `client/src/data/localization/units/en.json`
- `client/src/data/localization/units/en-us.json`
- `client/src/data/localization/units/de.json`
- `client/src/data/localization/units/fr.json`
- `client/src/data/localization/units/es.json`
- `client/src/data/localization/units/pt.json`
- `client/src/data/localization/units/it.json`
- `client/src/data/localization/units/ru.json`
- `client/src/data/localization/units/zh.json`
- `client/src/data/localization/units/ja.json`
- `client/src/data/localization/units/ko.json`
- `client/src/data/localization/units/ar.json`