# Regional Era Tables Expansion

## What & Why
Expand the Dates/Eras tab (built by the Year & Era Converter task) with full historical era coverage, organized into regional sections. Adds complete Japanese nengō, comprehensive Chinese regnal era names, ancient Near East convertible eras (Seleucid, Zoroastrian/Yazdegerdi), South and Southeast Asian fixed-offset eras (Kali Yuga, Bengali San, Kollam, Nepal Sambat, Chula Sakarat/Burmese), and Mesopotamian, Persian, and Mongol historical periods. All additions ride on the existing generic, data-driven era-table and period-range machinery — this is primarily a data task with a UI grouping enhancement.

## Done looks like
- The scheme list and results in the Dates/Eras pane are grouped into regional sections (e.g., Global/Modern, East Asia — Japan, East Asia — China, South & Southeast Asia, Middle East & Ancient Near East, Europe/Mediterranean), so the long era lists don't overwhelm the base offset schemes. Sections are collapsible or otherwise visually separated.
- Full Japanese nengō table: all ~240 eras from Taika (645 CE) through Reiwa, replacing/extending the Meiji-onward seed. Entering a year shows the correct nengō and era year (e.g., 1600 → Keichō 5). Pre-Meiji ±1 ambiguity (lunisolar new year) is indicated with the existing ±1 convention.
- Chinese regnal eras (niánhào): major-dynasty coverage from Han (140 BCE, Jiànyuán) through Qing (Xuāntǒng, ended 1912), following the primary/orthodox dynastic succession. Overlapping rival regimes (Three Kingdoms rivals, Southern/Northern courts, etc.) are out of the main lookup line; the table follows one orthodox line with a note explaining the convention. Output like "Kangxi 39" for 1700.
- New convertible fixed-offset schemes: Seleucid Era (year 1 = 312/311 BCE, ±1 note for the Babylonian vs. Macedonian reckoning) and Zoroastrian/Yazdegerdi era (from 632 CE, noted as approximate given the drifting 365-day calendar).
- New South & Southeast Asian fixed-offset schemes: Kali Yuga era (epoch 3102 BCE), Bengali San/Bangabda (~593 CE), Kollam era (825 CE), Nepal Sambat (879 CE), and Chula Sakarat/Burmese era (638 CE), each with ±1 indicators for non-January new years and per-scheme notes (e.g., Balinese/Javanese Saka noted as sharing the Indian Saka epoch).
- Historical Periods table gains Mesopotamian periods (Uruk, Early Dynastic, Akkadian, Ur III, Old Babylonian, Kassite, Neo-Assyrian, Neo-Babylonian, Achaemenid, Seleucid/Parthian), Persian dynastic periods (Achaemenid, Parthian, Sasanian, Islamic Persia), and Mongol periods (Mongol Empire ca. 1206–1368, Golden Horde ca. 1240s–1502, Yuan dynasty ca. 1271–1368), all marked "ca." with sources. Mongol/Golden Horde entries include a note that these polities used Chinese era names or the Hijri year rather than their own numeric era, so they appear here rather than as convertible schemes.
- Every new scheme/section name and note is localized in all 12 languages; era names themselves stay romanized (Kangxi, Keichō) per existing conventions, satisfying the translation-key integrity guard.
- Source citations for each new data file consistent with the app's sources notation conventions.
- Unit tests cover boundary years across the new tables (nengō transitions like 645, 1868; Chinese dynasty transitions; Seleucid/Yazdegerdi offsets; BCE-era lookups) plus JSON integrity of the new data files.
- lint-size passes; verify-build passes — if the full nengō + Chinese data pushes past the current gzip ceiling (~23 kB headroom), re-baseline the ceiling in verify-build with a note documenting the audited growth (this data addition is legitimate growth per prior audit practice).

## Out of scope
- Rival/parallel Chinese regimes' era names beyond the orthodox line (future data addition).
- Day-level or lunisolar date conversion; exact new-year-day handling.
- Korean, Vietnamese, or other regnal era systems (future data additions using the same shape).
- Post-1911 Mongolian Bogd Khan era names (tiny table, future data addition if requested).
- Sumerian year-name conversion and the Turco-Mongol 12-year animal cycle (not numeric era systems — covered only via Historical Periods).
- Any changes to the unit-conversion engine, Smart Paste, or other tabs.

## Steps
1. **Regional grouping UI** — Add a region/section field to the scheme and era-table data shape and group the Dates/Eras pane's scheme selector and results table by regional section, keeping the base offset schemes prominent.
2. **Japanese nengō data** — Author the full 645–present nengō JSON table with start years, romanized names, ±1 notes for pre-Meiji lunisolar years, and sources.
3. **Chinese niánhào data** — Author the orthodox-line era table from Han through Qing with start years, romanized names, dynasty annotations, and sources.
4. **Near East schemes & periods** — Add Seleucid and Yazdegerdi fixed-offset schemes with notes, and Mesopotamian + Persian + Mongol/Golden Horde period ranges to the Historical Periods data.
5. **South & Southeast Asian schemes** — Add Kali Yuga, Bengali San, Kollam, Nepal Sambat, and Chula Sakarat/Burmese fixed-offset schemes with ±1 indicators, notes, and sources.
6. **Localization** — Add all new scheme/section/note strings to the 12 language files, keeping era names romanized.
7. **Tests & build verification** — Vitest coverage for new table boundaries and offsets, JSON integrity checks, lint-size, and verify-build; re-baseline the gzip ceiling if needed with documentation.

## Relevant files
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
- `client/src/data/localization/ui`
- `client/src/lib/translateUi.ts`
- `scripts/verify-build.mjs`
