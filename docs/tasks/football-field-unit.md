# Football Field unit in Archaic Length

## What & Why
Add a "Football field" unit (100 yards = 91.44 m exactly) to the Archaic & Regional Length category so users can convert distances to/from American football field lengths.

## Done looks like
- "Football field" appears among the Archaic Length units in the converter
- 1 football field converts to exactly 91.44 m / 100 yd / 300 ft
- All data-integrity and translation-hygiene tests pass

## Out of scope
- Other sports field lengths (soccer pitch, etc.)
- Area units (football field as an area)

## Steps
1. **Add the unit** — Add a "Football field" entry to the Archaic Length dataset with factor 91.44 (100 yd), following the existing entry schema (id, symbol, unitType, measurementSystem, sourceUrl citing a reputable reference such as NCAA/NFL rulebook).
2. **Localization & guards** — Satisfy the translation-key hygiene guard for the new unit name if localization entries are required, and run json-integrity/build checks to confirm nothing regressed.

## Relevant files
- `client/src/data/conversion/archaic_length.json`
- `client/src/data/localization/ui/en.json`
