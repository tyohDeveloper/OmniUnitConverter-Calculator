# Rename "(UK)" to "(Imperial)" in unit names

## What & Why
Several unit display names use "(UK)" as their qualifier (e.g. "Long Ton (UK)", "Pint (UK)"). The correct convention for this app is "Imperial" (or the abbreviation "Imp." / "imp" in symbols). The symbols already consistently use "(imp)", so only the human-readable names need updating.

## Done looks like
- All unit names that previously showed "(UK)" now show "(Imperial)" in the UI (dropdowns, Compare All, RPN stack, etc.)
- Symbols are unchanged — they already use "(imp)"
- No other behaviour changes

## Out of scope
- Any renaming of internal IDs (e.g. `ton_uk`, `numberFormat: 'uk'`, locale codes — these are code-level identifiers, not displayed labels)
- Any unit conversions or factor changes

## Tasks
1. **Update mass.json** — Change the `name` field of the `ton_uk` entry from "Long Ton (UK)" to "Long Ton (Imperial)".
2. **Update cooking.json** — Change the `name` field of all five "(UK)" units (Teaspoon, Tablespoon, Fluid Ounce, Cup, Pint) from "(UK)" to "(Imperial)".
3. **Update affected tests** — Any test strings that assert on these unit display names should be updated to match the new "(Imperial)" wording.

## Relevant files
- `client/src/data/conversion/mass.json:94-99`
- `client/src/data/conversion/cooking.json:58-171`
- `tests/conversion.test.ts`
