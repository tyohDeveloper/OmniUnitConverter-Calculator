# Rename Archaic categories to Archaic & Regional

## What & Why
Rename the six category display names from "Archaic X" to "Archaic & Regional X" (Length, Mass, Volume, Area, Energy, Power). Reason: cultural sensitivity — units like rod, cord, chō, and wa are region-specific but still in use, so labeling them "Archaic" is inaccurate and potentially dismissive. The top-level group is already named "Archaic & Regional"; this makes the category names consistent with it. Width is not a concern: at 25 characters, "Archaic & Regional Length" renders at essentially the same pixel width as the existing "Equivalent Radiation Dose" category.

## Done looks like
- All six categories display as "Archaic & Regional Length/Mass/Volume/Area/Energy/Power" everywhere category names appear (converter, category pickers, compare views).
- All supported locales show a proper translation of the new names — no untranslated English fallbacks.
- CI/json-integrity guards pass (translation keys match the new category names).
- No change to URLs, internal IDs, or unit membership.

## Out of scope
- Splitting Regional units into a separate category set from Archaic units.
- Renaming internal category IDs (`archaic_length`, etc.) or JSON filenames — they stay as-is.
- Renaming the top-level group (already "Archaic & Regional").
- Adding, removing, or moving any units.

## Steps
1. **Rename category names in data** — Update the `name` field in the six archaic conversion JSON files and the matching display names in the category dimensions registry.
2. **Update translation keys across locales** — Replace the six "Archaic X" keys with "Archaic & Regional X" keys in every UI locale file, with proper translations per language (not English copies), following the translation key hygiene rules so the json-integrity guard passes.
3. **Sweep remaining references and verify** — Update any doc/source references to the old display names where appropriate, then run the test suite and confirm the new names render in the UI without truncation issues.

## Relevant files
- `client/src/data/conversion/archaic_length.json`
- `client/src/data/conversion/archaic_mass.json`
- `client/src/data/conversion/archaic_volume.json`
- `client/src/data/conversion/archaic_area.json`
- `client/src/data/conversion/archaic_energy.json`
- `client/src/data/conversion/archaic_power.json`
- `client/src/lib/units/categoryDimensions.ts:67-72`
- `client/src/data/localization/ui/en.json`
- `client/src/features/unit-converter/categoryGroups.ts:42`
