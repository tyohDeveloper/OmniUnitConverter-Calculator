# Move App-Shell Default-Unit Table To JSON

> **Source.** Generated from the model-council architecture pass in `docs/perplexity/`. See [architecture-pass-council-synthesis.md](../perplexity/architecture-pass-council-synthesis.md) and [architecture-standards.md](../perplexity/architecture-standards.md).
> **Priority.** P2. Same defect class as council-03 but smaller.
> **Standards reference.** §1.5 (data external), §5.1 (single source of truth).

## What & Why
`client/src/features/unit-converter/app/UnitConverterApp.tsx:99-125` embeds a per-category default-unit table (`temperature→'k'`, `volume→'l'`, `capacitance→'f'`, `math→'num'`, …) as a code literal. Claude Fable 5 flagged this in the council pass: it is data-in-code inside the app shell — the same violation as the `dimMap` (council-03), just less obvious.

## Done looks like
- The default-unit table moves to `client/src/data/conversion/category-defaults.json` with a Zod schema alongside it.
- A thin loader at `client/src/lib/units/categoryDefaults.ts` (single export, ≤20 lines) reads and validates the JSON.
- `UnitConverterApp.tsx` imports and uses the loader; the inline literal is deleted.
- `tests/json-integrity.test.ts` gains a check that every id in `CONVERSION_DATA` has an entry in `category-defaults.json` (or an explicit "no default" marker) and that every listed default corresponds to a real unit in that category.

## Out of scope
- Changing which unit is the default for any category.
- Consolidating with the `CATEGORY_DIMENSIONS` catalog (they answer different questions).

## Tasks
1. **Extract the table** at `UnitConverterApp.tsx:99-125` into `client/src/data/conversion/category-defaults.json`.
2. **Add schema and loader.** `lib/units/categoryDefaults.ts` returns the map; Zod schema validates on first import.
3. **Update the app shell** to import from the loader.
4. **Extend `tests/json-integrity.test.ts`** to cover coverage and validity.

## Relevant files
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
- `client/src/data/conversion/category-defaults.json` (new)
- `client/src/lib/units/categoryDefaults.ts` (new)
- `tests/json-integrity.test.ts`
