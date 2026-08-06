# Reigns Expansion: Inca, Aztec, Mesopotamia, India, Kush/Aksum

## What & Why
Extend the Rulers & Reigns reference widget (Task #140) with five more regions, and fill any gaps in the Historical Periods widget for those regions. These are reference-widget additions only — none of these become schemes in the year/date converter itself.

## Done looks like
- The Rulers & Reigns region picker gains five new regions, each a curated major-rulers list grouped by dynasty/empire, with the reigning ruler highlighted for the selected year:
  1. **Mesopotamia** — Neo-Assyrian (Tiglath-Pileser III, Sargon II, Sennacherib, Esarhaddon, Ashurbanipal) and Neo-Babylonian (Nabopolassar, Nebuchadnezzar II, Nabonidus); optionally earlier landmarks (Sargon of Akkad, Hammurabi) with circa flags. Ends 539 BCE (fall to Cyrus).
  2. **India** — Maurya (Chandragupta, Bindusara, Ashoka), Kushan (Kanishka), plus a few later landmarks if well-attested (e.g., Gupta: Chandragupta II). Heavy use of circa flags.
  3. **Kush & Aksum** — Kushite 25th Dynasty (Piye, Shabaka, Taharqa), Meroë landmarks where attested, Aksum (Ezana). Circa flags throughout.
  4. **Aztec** — Huey Tlatoani line: Itzcoatl, Moctezuma I, Ahuitzotl, Moctezuma II, ending Cuauhtémoc (1521).
  5. **Inca** — Sapa Inca line: Pachacuti, Topa Inca Yupanqui, Huayna Capac, Huáscar/Atahualpa (concurrent civil-war overlap handled), ending 1533; optionally Vilcabamba rump state to 1572 as a noted coda.
- Historical Periods widget: add a period column for any of these regions not already covered — India at minimum; Kush/Aksum, Inca, and Aztec periods only if Task #135 has not already added them (check its merged output first; do not duplicate).
- Rulers with only approximate dates show "c."; regions with weak attestation stay short rather than padded.
- No new schemes in the year converter dropdown; converter behavior unchanged.
- Localization keys for new region/dynasty/epithet labels in all 12 languages; ruler names untranslated; json-integrity guard passes.
- Unit tests for the new datasets (year lookup, overlaps like Huáscar/Atahualpa, BCE boundaries); lint-size, typecheck, test, and verify-build pass. Watch the gzip size ceiling (~23 kB headroom before this work); if the additions cannot fit, surface the size problem rather than silently trimming.

## Out of scope
- Adding any of these as date-converter schemes.
- Exhaustive king lists (e.g., full Assyrian King List, all Kushan rulers).
- England/France post-814 European monarchs (possible later task).
- Changes to the reigns widget UI or data schema beyond adding entries (schema is designed to be region-extensible; if a small field addition is genuinely needed, keep it backward compatible).

## Steps
1. **Verify coverage baseline** — Check the merged state of the Historical Periods data (including Task #135 output) to determine which of the five regions need new period columns; check the reigns schema from Task #140.
2. **Author datasets** — Write the five regional ruler datasets from reputable sources, with dynasty grouping, circa flags, and the Inca civil-war overlap; add missing period columns (India, and others if absent).
3. **Localization & tests** — Add translation keys across all 12 locales, extend lookup unit tests for the new data, and confirm build size and all CI checks.

## Relevant files
- `client/src/data/eras/historicalPeriods.json`
- `client/src/lib/eras/lookupPeriods.ts`
- `client/src/lib/eras/types.ts`
- `client/src/features/unit-converter/components/EraPane.tsx`

Note: this task builds directly on Task #140 (Rulers & Reigns reference table) and must be implemented after it — it extends the widget and data files that task creates.
