# Fill Missing Unit Name Translations

## What & Why
Roughly 239 unit names have no translation in any of the 11 non-English locales, so they display in English (e.g. Japanese shows "Microgram", "Long Ton (Imperial)", "Barrel of Oil Equivalent", "Half-life (seconds)", "Per Hour"). Two causes: recently added units never received translation entries, and the "(UK)" → "(Imperial)" rename changed lookup keys so old translations (e.g. "Long Ton (UK)") went stale.

## Done looks like
- Every unit name in `client/src/data/conversion/*.json` has an entry in all 12 locale files (en, en-us, de, es, fr, it, ja, ko, pt, ru, zh, ar), with proper native translations — not English copies — wherever a natural translation exists.
- Stale keys from the UK→Imperial rename are migrated to the new "(Imperial)" keys and the old keys removed.
- Compound suffixes like "per Hour", "per Minute", "Per Day" etc. are translated in all languages.
- BTU policy: "BTU" stays as "BTU" in all languages except Chinese (英熱単位), Russian (БТЕ), and Arabic (وحدة حرارية بريطانية), where the native abbreviation is standard. Compound names like "BTU per Hour" translate only the suffix.
- A coverage test fails if any unit name lacks an entry in any locale, preventing regressions.
- Build still passes verify-build; if the added translations exceed the gzip size ceiling, re-baseline the ceiling accordingly.

## Out of scope
- UI string translations (labels, buttons) — this task covers unit names only.
- Adding new languages.
- Changing unit symbols (symbols stay untranslated per existing convention).

## Steps
1. **Generate the missing-key list** — Script-diff all unit names from the conversion JSON files against each locale file to produce the definitive per-language gap list, and identify stale keys (translations whose key no longer matches any unit name).
2. **Migrate renamed keys** — Move translations from old "(UK)"-style keys to the current "(Imperial)" names; delete keys that no longer correspond to any unit (verify first that they aren't used elsewhere, e.g. math-function or category-name lookups).
3. **Translate missing entries for all 11 non-English locales** — Provide natural translations for each missing unit name. Keep internationally standard abbreviations (BTU, TEU, LNG, TNT, E-85, U for rack units) untranslated except where a native form is established (zh/ru/ar for BTU). Translate suffixes like "per Hour", "of Diesel", "Half-life", "Mean Lifetime" consistently within each language. Preserve British/American spelling variant handling for en vs en-us.
4. **Add coverage test** — Extend the JSON integrity tests so every unit name must exist in every locale file, and no locale contains orphaned unit-name keys.
5. **Verify build size** — Run the full test suite and verify-build; re-baseline the gzip ceiling if the new translations exceed it.

## Relevant files
- `client/src/data/localization/units/ja.json`
- `client/src/data/localization/units/en.json`
- `client/src/data/conversion/mass.json`
- `client/src/lib/translateUnit.ts`
- `tests/localization.test.ts`
- `tests/json-integrity.test.ts`
- `scripts/vite-plugin-prune-translations.ts`
