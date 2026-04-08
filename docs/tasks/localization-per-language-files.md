# Restructure Localization Into Per-Language Files

## What & Why
The two monolithic translation JSON files (`ui-translations.json`, `unit-name-translations.json`) use a key-first structure: every entry is a source string containing translations for all languages. This makes it hard to review or update a single language — strings for any given language are scattered across thousands of lines.

The goal is to flip this to a language-first layout, with one JSON file per language per domain, so all Spanish strings are in one place, all Japanese strings in another, etc.

The target layout will be:
```
client/src/data/localization/
  ui/
    en.json, en-us.json, ar.json, de.json, es.json,
    fr.json, it.json, ja.json, ko.json, pt.json, ru.json, zh.json
  units/
    en.json, en-us.json, ar.json, de.json, es.json,
    fr.json, it.json, ja.json, ko.json, pt.json, ru.json, zh.json
```

Each file is a flat `Record<string, string>` — just key/value pairs for that language, with no nested structure.

The two domains (ui vs units) are kept separate because their lookup functions are separate and key names can overlap (e.g. "Second" could appear in both).

Since the app compiles to a single standalone HTML file, all translation data is bundled regardless — this change is purely for developer ergonomics, not runtime performance. Static imports of all files are used.

## Done looks like
- Both original JSON files are gone; replaced by 24 per-language JSON files under `ui/` and `units/`
- Every language's strings are together in one file, easy to scan and edit
- The app behaves identically — all translations still work for every locale
- All existing tests pass

## Out of scope
- Adding or changing any translation strings (content is preserved exactly)
- Changing the set of supported languages
- Dynamic/lazy loading (not applicable for a single-file build)

## Tasks
1. **Write a one-off migration script** that reads the two existing JSON files and writes the 24 per-language output files. Run the script to produce the new files, then delete the script and the two original files.

2. **Update `translateUi.ts`** — replace the single JSON import with static imports of all 12 `ui/*.json` files and merge them into `UI_TRANSLATIONS` as `Record<string, Record<string, string>>` (language → key → string). Update the `translateUi()` lookup accordingly.

3. **Update `translateUnit.ts`** — same pattern as above using the `units/*.json` files.

4. **Update `localization.ts`** — the `Translation` interface and the generic `translate()` function signature should reflect the new `Record<string, Record<string, string>>` shape. Remove the now-unused `Translation` interface if nothing else depends on it.

5. **Update tests** — `localization.test.ts`, `json-integrity.test.ts`, and `characterization.test.ts` reference `UI_TRANSLATIONS` and `UNIT_NAME_TRANSLATIONS` directly. Adjust any test that relies on the old per-key nested shape.

## Relevant files
- `client/src/data/localization/ui-translations.json`
- `client/src/data/localization/unit-name-translations.json`
- `client/src/lib/localization.ts`
- `client/src/lib/translateUi.ts`
- `client/src/lib/translateUnit.ts`
- `tests/localization.test.ts`
- `tests/json-integrity.test.ts`
- `tests/characterization.test.ts`
