# Year & Era Converter Tab

## What & Why
Add a new "Dates/Eras" section (a dedicated tab placed after the RPN Calculator tab, at the end of the tab list) that converts year numbers between calendar era systems, plus a historical-periods reference table. This is deliberately isolated from the unit-conversion engine: calendars are not registered as units, so Smart Paste, prefixes, comparison mode, and dimensional analysis are unaffected.

## Done looks like
- A new tab positioned after the RPN Calculator tab (last in the tab order). User enters a year and picks its scheme; the pane shows that year rendered in every supported scheme at once (comparison-style table), converted via astronomical CE year (year 0 = 1 BCE) as the hub.
- Tier 1 fixed-offset schemes supported: Gregorian CE/BCE (root), Buddhist Era (+543), Minguo/ROC (−1911), Juche (−1911), Hebrew AM (+3760), Byzantine AM (+5508), Ab Urbe Condita (+753), Saka era (−78), Vikram Samvat (+57), Holocene Era (+10000), Ethiopian (−7/8), Solar Hijri (−621/622).
- Tier 2: Islamic lunar Hijri (AH) via a nonlinear formula (AH ≈ (CE − 622) × 1.030690), clearly marked as approximate.
- Every scheme whose new year is not January 1 displays a ±1 indicator (e.g. "2569 BE (±1)") and/or a short per-scheme note; Hijri additionally notes drift over centuries.
- Japanese imperial eras handled via a generic piecewise era-table scheme (data-driven JSON: era name + start year), scoped to Meiji Restoration onward (Meiji, Taishō, Shōwa, Heisei, Reiwa). Output like "Reiwa 8". The lookup logic is generic so future era tables (full nengō, Chinese regnal eras) are pure data additions.
- A "Historical Periods" reference widget/table in the same pane: given the entered CE year, highlights which period it falls in per civilization; also browsable as a table of named date ranges. Seed data: Egyptian kingdoms/periods (Old/Middle/New Kingdom, Intermediate Periods, Late/Ptolemaic), ancient Chinese dynasties, and Maya periods (Preclassic/Classic/Postclassic). Ranges shown as approximate ("ca."), sourced. Same JSON shape as era tables so more civilizations can be added later as data only.
- BCE input handled: UI accepts BCE years (or negative astronomical years) and documents the convention.
- Scheme names and pane UI strings localized in all 12 languages; era names (Reiwa etc.) stay romanized/native per existing symbol-preservation conventions.
- Source citations/notes per scheme, consistent with the app's sources notation conventions (caret exponent form if any formulas are shown).
- Unit tests for offset conversion, BCE/year-0 handling, Hijri approximation, era-table lookup (including boundary years like 1912, 1926, 1989, 2019), and period-range lookup. Existing tests, lint-size rules (<100-line files, <20-line functions), and verify-build gzip ceiling still pass; estimated addition ~5–8 kB gzipped, within current headroom.

## Out of scope
- Day-level date conversion (month/day, Julian Day Numbers, Hebrew/Chinese lunisolar algorithms) — future separate task.
- Full Japanese nengō before Meiji, Chinese regnal era tables, Egyptian dynasty-by-dynasty precision — data additions later.
- Registering any of this in the unit engine, Smart Paste, or the converter/calculator panes.

## Steps
1. **Data model & scheme data** — Define JSON shapes for (a) fixed-offset schemes, (b) piecewise era-table schemes, (c) historical period ranges; create the data files with the Tier 1/2 schemes, Meiji-onward Japanese eras, and Egyptian/Chinese/Maya period seed data, each with notes and sources.
2. **Conversion logic** — Pure functions: astronomical-year hub conversion for offsets, the Hijri lunar approximation, generic era-table lookup (year → era name + era year), and period-range lookup. Follow the pure-function file-size rules.
3. **Dates/Eras pane UI** — New pane component with year input (BCE support), scheme selector, all-schemes results table with ±1 indicators and notes, and the historical-periods widget; register the new tab in the app shell after the calculator tabs.
4. **Localization** — Add scheme names and pane UI strings to all 12 language files, keeping era names romanized; satisfy the translation-key integrity guard.
5. **Tests & verification** — Vitest coverage for conversions, era boundaries, BCE handling, and period lookup; run lint-size and verify-build to confirm the gzip ceiling holds.

## Relevant files
- `client/src/features/unit-converter/app/UnitConverterApp.tsx:276-313`
- `client/src/features/unit-converter/components/CalculatorPane.tsx`
- `client/src/lib/conversion-data.ts`
- `client/src/lib/units/conversionFunctionRegistry.ts`
- `client/src/data/localization/ui`
- `client/src/lib/translateUi.ts`
