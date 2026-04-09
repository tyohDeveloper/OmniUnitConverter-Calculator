---
title: Set default volume unit to litre
---
# Set Default Volume Unit to Litre

## What & Why
The volume converter currently defaults to cubic meter, as it is the SI base unit. The more practical and commonly encountered unit is the litre, so it should be the default shown when a user opens the volume category.

## Done looks like
- Opening the volume converter shows litre pre-selected as the default unit (both from and to)
- All other categories are unaffected

## Out of scope
- Changing the base unit used for conversion calculations (cubic meter stays as the mathematical base)
- Changing defaults for any other category

## Tasks
1. Implement a mechanism to designate a preferred default display unit separate from the SI base unit — either a `default` flag in the unit data or a per-category override — and apply it so that litre is selected by default in the volume category.

## Relevant files
- `client/src/data/conversion/volume.json`
- `client/src/lib/conversion-data.ts`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`