# Phase 3: Split Large Data Structures

## What & Why
The translation dictionaries, conversion factor tables, and unit definitions are massive inline TypeScript objects that inflate file sizes and cause unnecessary merge conflicts when any unit or translation is updated. Moving them to JSON files (which Vite imports natively) separates data from logic and allows non-developer contributors to update data without touching code files.

## Done looks like
- `lib/localization.ts` is split: UI translation data → `data/localization/ui-translations.json` (one file per language or one file per translation domain), unit name translations → `data/localization/unit-translations.json`. A thin `translateUi.ts` and `translateUnit.ts` function file each import from their respective JSON.
- `lib/conversion-data.ts` data is split into `data/conversion/` — one JSON file per unit category (length, mass, temperature, energy, etc.), with a thin loader/accessor function per category or a single `loadConversionData.ts` that composes them.
- `lib/unit-translations.ts` data is moved into `data/localization/` JSON files and the source file is removed.
- All JSON files are properly typed via TypeScript (using `as const` imports or a generated type from the JSON schema).
- All tests pass. Build still produces a valid single-file HTML output.

## Out of scope
- Changing any translation strings or conversion factors (data-only migration, no value changes)
- Logic function decomposition (Phase 2)
- UI or state changes

## Tasks
1. **Split localization data** — Move `UI_TRANSLATIONS` and `UNIT_NAME_TRANSLATIONS` from `localization.ts` into per-domain (or per-language) JSON files under `data/localization/`. Rewrite the `translate` function to import from JSON.
2. **Split conversion factor data** — Move each unit category's conversion table from `conversion-data.ts` into its own JSON file under `data/conversion/`. Write a thin loader that assembles the full map.
3. **Migrate `unit-translations.ts`** — Move its data into the localization JSON files and delete the source file.
4. **Verify JSON integrity** — Add schema/fixture tests that confirm all expected keys are present in each JSON file and that round-tripping a conversion or translation lookup returns the correct value.

## Relevant files
- `client/src/lib/localization.ts`
- `client/src/lib/unit-translations.ts`
- `client/src/lib/conversion-data.ts`
- `tests/localization.test.ts`
- `tests/conversion.test.ts`
- `vite.config.ts`
