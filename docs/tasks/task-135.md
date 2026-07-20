---
title: African, Mesoamerican & Andean Historical Periods
---
# African, Mesoamerican & Andean Historical Periods

## What & Why
The Historical Periods reference widget in the Dates/Eras tab currently covers only Ancient Egypt, Ancient China, and the Maya. Add major African civilizations, expand Mesoamerican coverage beyond the Maya, and add an Andean (South American) section, so the widget gives balanced world coverage. Pure data addition following the existing civilization/periods JSON pattern.

## Done looks like
- The Historical Periods widget shows new civilizations with dated periods, each with a source URL, grouped consistently with the regional-section organization introduced by the Regional Era Tables Expansion task:
  - **Africa**: Kush/Nubia (Kerma, Napata, Meroë), Aksum, Ghana Empire, Mali Empire, Songhai Empire, Kanem–Bornu, Great Zimbabwe, Benin Kingdom, Ethiopian Solomonic dynasty, Zulu Kingdom
  - **Mesoamerica**: Olmec, Zapotec (Monte Albán), Teotihuacan, Toltec, Aztec/Mexica (alongside existing Maya)
  - **Andean**: Chavín, Moche, Nazca, Tiwanaku, Wari, Chimú, Inca
- BCE dates use negative astronomical years consistent with existing entries (year 0 = 1 BCE)
- Period date ranges match mainstream scholarly consensus (Wikipedia-level), each civilization cites a source URL
- New civilization and period names are added to all 12 language localization files, passing the translation key hygiene guard test
- Existing tests, lint-size rules, and the single-file build size check still pass

## Out of scope
- New convertible era/calendar schemes (Ethiopian calendar already exists as an offset scheme)
- North American cultures (Mississippian, Ancestral Puebloans, etc.)
- Changes to the year converter logic or era tables

## Steps
1. **Add civilization data** — Extend the historical periods JSON with the African, Mesoamerican, and Andean civilizations listed above, using verified date ranges and source URLs, in the regional grouping structure established by the Regional Era Tables Expansion task.
2. **Localization** — Add translated names for the new civilizations and periods across all 12 language files, preserving proper nouns where translation is not customary.
3. **Verify** — Confirm the widget renders all new sections correctly, and run tests, lint-size, and build-size verification.

## Relevant files
- `client/src/data/eras/historicalPeriods.json`
- `client/src/lib/eras/`
- `client/src/data/eras/eraSchemes.json`