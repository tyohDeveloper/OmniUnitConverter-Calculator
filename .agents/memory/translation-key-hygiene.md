---
name: Unit translation key hygiene
description: How unit-name translation keys are consumed and how the no-dead-keys guard works.
---
The rule: every key in the unit-name locale files must be either a current unit/category name from the conversion JSONs, the title-cased baseUnit, a key literally referenced by app code via t()/translateUnit, or a prefix-generated display name. A guard test in tests/json-integrity.test.ts ("no dead keys") enforces this against an explicit allowlist.

**Why:** Renames in conversion data silently left ~120 orphaned keys duplicated across 12 locale files, bloating the single-file bundle. The older drift test only caught non-en locales diverging from en.json, not en.json itself going stale.

**How to apply:** When renaming/removing a unit, remove its old translation key from all 12 locale files. When adding a code-referenced or prefix-generated translation key, add it to the guard test's allowlist. Beware false positives when auditing: lowercase strings in code/tests ("celsius", "ohm", "m³/s") are usually unit IDs or symbols, not translation keys.

**Global name-keyed translations:** unit display names are translation keys shared across ALL categories, so two units in different categories cannot share the same English name (e.g. mass "Dan (China)" vs volume dan — the volume one is "Dan (China, Volume)"). Renames must keep names globally unique.
