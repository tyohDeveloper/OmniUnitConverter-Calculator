# LLM review of new machine translations

## What & Why
~240 unit names were recently translated into 10 languages (de, es, fr, it, pt, ru, ja, ko, zh, ar) in client/src/data/localization/units/*.json. Translations for obscure archaic/regional units (e.g. Hath, Gaj, Picul, Seer) and compound flow/fuel names were generated programmatically and are unreviewed. Use an LLM to verify and correct them — no human/native-speaker review.

## Done looks like
- Each locale file's newly added entries verified by an LLM for correctness and naturalness in that language
- Awkward or wrong translations corrected in the JSON files
- Standard unit symbols and SI prefixes left untouched (per project convention)
- Tests still pass (tests/json-integrity.test.ts enforces coverage)

## Out of scope
- Human/native-speaker review
- Retranslating entries that the LLM confirms as fine
- UI string localization files (only unit name files)

## Steps
1. **LLM verification pass** — For each of the 10 locale files, have an LLM review the newly added unit name entries for accuracy and naturalness, flagging problematic ones.
2. **Apply corrections** — Update flagged entries in the JSON files, preserving symbols and British/American variant handling.
3. **Validate** — Run the JSON integrity tests and existing localization tests to confirm nothing broke.

## Relevant files
- `client/src/data/localization/units/de.json`
- `client/src/data/localization/units/es.json`
- `client/src/data/localization/units/fr.json`
- `client/src/data/localization/units/it.json`
- `client/src/data/localization/units/pt.json`
- `client/src/data/localization/units/ru.json`
- `client/src/data/localization/units/ja.json`
- `client/src/data/localization/units/ko.json`
- `client/src/data/localization/units/zh.json`
- `client/src/data/localization/units/ar.json`
- `tests/json-integrity.test.ts`
