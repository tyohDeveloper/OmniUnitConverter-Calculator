# Rulers/Reigns Reference Table in Dates/Eras Tab

## What & Why
Add a "Rulers & Reigns" reference widget to the Dates/Eras tab, separate from the existing Historical Periods table. Goal: help a novice decode phrases like "in the reign of Xerxes" — pick a region, see its curated major-ruler list, with the ruler(s) reigning in the currently selected year highlighted. Same year-driven highlighting pattern as the periods widget, but with a region picker because ruler lists are too long to show all regions at once.

## Done looks like
- A new card/section in the Dates/Eras tab (below or near the Historical Periods card) with a region selector (dropdown or toggle group).
- Selecting a region shows its ruler list grouped by dynasty/empire (e.g., Persia → Achaemenid / Parthian / Sasanian sections), each ruler with name, epithet, and reign years (BCE/CE formatting matching the periods widget).
- The ruler(s) whose reign contains the selected year are highlighted, same visual convention as the periods table (`text-accent font-medium`).
- If the selected year falls in a gap (e.g., Persia 330–247 BCE under Alexander/Seleucids), show a brief gap note instead of a false highlight.
- Each region header links to a source URL (Wikipedia), matching the periods widget convention.
- Regions in v1 (curated "major rulers" lists, ~10–25 per region, like the user's Persia document):
  1. **Persia** — Achaemenid (Cyrus II → Darius III), Parthian (Arsaces I, Mithridates I & II, Orodes II, Artabanus IV), Sasanian (Ardashir I, Shapur I & II, Khosrow I & II, Yazdegerd III). Ends 651 CE.
  2. **Rome/Europe** — major emperors Augustus → fall of the West (476), then a short bridge (e.g., Justinian, Charlemagne) ending at Charlemagne's death (814).
  3. **Egypt** — major pharaohs (e.g., Narmer/Djoser/Khufu, Hatshepsut, Thutmose III, Akhenaten, Tutankhamun, Ramesses II, ends Cleopatra VII, 30 BCE).
  4. **China** — curated major emperors from Qin Shi Huang through Puyi's abdication (1912): e.g., Qin Shi Huang, Han Gaozu, Han Wudi, Tang Taizong, Wu Zetian, Song Taizu, Kublai Khan, Hongwu, Yongle, Kangxi, Qianlong.
  5. **Maya** — Classic-period kings with well-attested reigns (e.g., K'inich Janaab' Pakal of Palenque, Jasaw Chan K'awiil I of Tikal, Yuknoom Ch'een II of Calakmul), with city noted per ruler since Maya had no single throne.
- Data format is region-extensible: adding a future region (Inca, Aztec, Mesopotamia, Maurya India, Kush/Aksum) requires only a new JSON entry, no code changes.
- Localization: region names, dynasty labels, and epithets ("the Great") get translation keys in all 12 languages; ruler proper names stay as standard untranslated transliterations. Translation keys must satisfy the existing json-integrity guard test conventions.
- All approximate reign starts (e.g., "r. c. 559 BCE") carry a circa flag rendered as "c." — no false precision.
- New UI elements have data-testid attributes; unit tests cover the year→ruler lookup (including gaps, overlaps like Maya concurrent kings, and BCE boundaries); lint-size, typecheck, test, and verify-build all pass. Watch the gzip build-size ceiling — curated lists should fit within current headroom; if not, flag rather than silently trimming content.

## Out of scope
- Additional regions (Inca, Aztec, Mesopotamia/Assyria-Babylon, India, Kush/Aksum, England/France post-814) — future tasks; the data format must merely make them easy to add.
- Exhaustive king lists (all ~170 pharaohs, every Roman emperor) — curated major rulers only.
- Regnal-year arithmetic ("3rd year of the reign of…") — display and highlight only.
- Any change to the existing Historical Periods widget or to Task #135's scope.
- Ruler biographies/commentary — name, epithet, reign span, dynasty only.

## Steps
1. **Data model & content** — Define the reigns data schema (regions → dynasties → rulers with signed astronomical start/end years, circa flags, optional city/note field) and author the five region JSON datasets from reputable sources, following the existing eras data conventions.
2. **Lookup logic** — Pure-function lookup that maps an astronomical year to the reigning ruler(s) within a region, handling gaps, overlaps, and boundary years; respect the project's strict pure-function file-size rules.
3. **UI widget** — New card in the Era pane with region picker, dynasty-grouped ruler table, current-reign highlighting, gap notes, and source links, styled consistently with the Historical Periods card.
4. **Localization & tests** — Add translation keys for region/dynasty/epithet strings across all 12 locales, satisfy the json-integrity guard, and add unit tests for lookup logic plus a smoke check that the build stays under the size ceiling.

## Relevant files
- `client/src/data/eras/historicalPeriods.json`
- `client/src/lib/eras/lookupPeriods.ts`
- `client/src/lib/eras/types.ts`
- `client/src/features/unit-converter/components/EraPane.tsx`
