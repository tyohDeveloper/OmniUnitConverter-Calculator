# Date Converter under Other Category

## What & Why
Add a "Date" converter as a new category under the "Other" group. It converts a calendar date between all calendar systems supported by the official TC39 Temporal polyfill (`@js-temporal/polyfill`): ISO 8601/Gregorian, Buddhist, Chinese, Coptic, Dangi, Ethiopic (both variants), Hebrew, Indian, Islamic variants (civil, tabular, umm-al-qura, etc.), Japanese, Persian, and ROC. Calendars only — no Unix timestamp, ISO string output field, or Julian Day Number representations.

## Done looks like
- A "Date" entry appears under the Other category group; selecting it shows a date converter UI instead of the usual unit dropdowns.
- User picks an input calendar and enters a date (calendar-appropriate fields: era/year/month/day, with month lists that respect leap months in lunisolar calendars like Hebrew and Chinese); the same date is shown in all other calendars (or a chosen target calendar).
- Displayed dates are localized via the browser's `Intl.DateTimeFormat` in all 12 app languages (month names, eras, digits per locale conventions).
- Smart Paste never matches date text or routes anything to this category.
- The calculator and RPN modes are unaffected: the Date category is excluded from the calculator dimension map, cross-domain matches, and comparison mode. Switching to the Date category while in calculator view degrades gracefully (calculator hidden or falls back sensibly, no crashes).
- Invalid dates (e.g., day out of range for the month/calendar) show a clear inline error, not silent fallback.
- Build passes `verify-build`; single-file HTML output still works offline.

## Out of scope
- Time-of-day, time zones, durations, and date arithmetic.
- Unix timestamp, ISO string field, Julian Day Number outputs.
- Smart Paste support and calculator integration for dates.
- Julian (old-style) calendar (not provided by Temporal/Intl).

## Steps
1. **Embed the Temporal polyfill with minimal footprint** — Add `@js-temporal/polyfill` as a dependency and import only what's needed (`Temporal.PlainDate` and calendar conversion via `withCalendar`), NOT the global polyfill installer. Verify tree-shaking removes unused code (Duration/ZonedDateTime/Instant paths, tests, CJS duplicates); check what actually lands in the bundle and prefer the ESM build. Measure the gzip delta and re-baseline the verify-build size ceiling only by the audited, justified amount — document the delta in the baseline note per existing convention.

2. **Date category registration without unit data** — Register a `date` category ID in the category type union and the Other group, but do not give it factor-based unit JSON. Explicitly exclude it from the smart-paste symbol map, `CATEGORY_DIMENSION_MAP`, calculator/RPN unit suggestion paths, cross-domain matching, and comparison mode via a category-level guard (not just absence of units), so nothing crashes or matches accidentally.

3. **Date converter UI** — Build the converter pane for the Date category: input calendar selector, structured date entry (era where applicable, year, month via localized dropdown, day), target calendar selector plus an "all calendars" list view. Use `Intl.DateTimeFormat` with the `calendar` option for localized display and `Intl` data for month/era names; validate input ranges per calendar and surface clear errors. Follow the app's aesthetic and existing state-module patterns (useReducer, one-file-per-concern, pure-function file size rules: <100 lines/file, <20 lines/function, 1 exported function per file). Add `data-testid` attributes.

4. **Localization** — Add UI strings (category name "Date", field labels, calendar display names where Intl doesn't provide them) to all 12 `ui/*.json` files. Do not add unit-name translation keys; if the json-integrity guard test requires an allowlist entry for the new category, add it per the documented convention.

5. **Tests** — Vitest unit tests for calendar round-trip conversions (known reference dates across calendars, leap-month cases in Hebrew/Chinese, era handling in Japanese/ROC), guard tests confirming Smart Paste and calculator exclusion, and localization checks. Run the full existing suite plus lint-size and verify-build.

## Relevant files
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
- `client/src/lib/conversion-data.ts`
- `client/src/lib/translateUi.ts`
- `client/src/lib/translateUnit.ts`
- `client/src/data/localization/ui/en.json`
- `client/src/data/localization/units/en.json`
- `scripts/verify-build.mjs`
