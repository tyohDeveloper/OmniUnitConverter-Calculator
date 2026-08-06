# Timezone converter under Other

## What & Why
Add a Timezone category to the "Other" group that converts a clock time between official world timezones. Unlike other categories, the "units" are timezones (each defined by its UTC offset) and the value being converted is a time of day, entered as HH:MM. This is a special-case category: it does not participate in Smart Paste, the calculator, RPN, or Comparison mode.

## Done looks like
- A "Timezone" category appears in the Other group of the sidebar.
- The unit list contains both named zones (standard AND daylight variants, e.g. EST and EDT, CET and CEST, JST, IST, NPT, ACST/ACDT, chatham time, etc.) and the full set of generic UTC offset entries (UTC−12:00 through UTC+14:00, including half-hour and 45-minute offsets that officially exist).
- Non-hour-aligned zones work correctly (e.g. India +5:30, Nepal +5:45, Chatham +12:45).
- The default/base "unit" is UTC.
- The user enters a clock time as HH:MM (24-hour); entering plain decimal is not required.
- The converted result shows HH:MM in the target zone, with a +1 day / −1 day indicator when the conversion crosses midnight.
- Timezone units are excluded from Smart Paste parsing, calculator/RPN unit-aware operations, and Comparison mode.
- Timezone names are localized in all 12 languages following the existing translation-key hygiene rules (en.json keys must match unit names; guard test in json-integrity enforces this).
- Existing tests still pass; new unit tests cover offset math, day wrap, and non-hour-aligned zones; the single-file build stays under the gzip size ceiling enforced by verify-build (note: only ~23 kB headroom as of July 2026 — keep the zone list lean or re-baseline if legitimately needed).

## Out of scope
- Automatic DST rules / date-aware DST switching (standard and daylight variants are simply separate entries in the list; the user picks which applies).
- Full IANA tz database or city-based lookup.
- Smart Paste, calculator, RPN, and Comparison mode support.
- Date conversion / calendars (covered by Task #170).

## Steps
1. **Data model** — Create the timezone category JSON with UTC as base unit, storing each zone's offset in minutes. Include named standard/daylight zones and generic UTC±HH:MM entries. Decide how the offset conversion plugs into the existing conversion pipeline (offsets are affine like temperature, but the day-wrap at 24h means conversion should be handled by a dedicated path or a named entry in the conversion function registry, marked non-linear so `isNonLinearUnit` exclusion applies).
2. **HH:MM input/output UI** — When the timezone category is active, the converter pane accepts HH:MM input (with validation) and renders results as HH:MM plus a +1/−1 day badge when the result wraps past midnight. Other categories keep their normal numeric field.
3. **Feature exclusions** — Ensure timezone units are skipped by Smart Paste symbol/name maps, calculator alternate-unit suggestions, RPN, and Comparison mode (verify the existing `isNonLinearUnit`-based exclusion covers all of these; add an explicit category-level exclusion where it does not, e.g. Comparison mode).
4. **Localization** — Add translated zone names to all 12 language files, keeping standard abbreviations (EST, JST, NPT…) untranslated as symbols, and satisfying the en.json key-hygiene guard test.
5. **Tests & build verification** — Add unit tests for offset conversion, midnight wrap with day indicator, non-hour-aligned zones, and HH:MM parsing/formatting; run the full test suite, lint-size, and verify-build.

## Relevant files
- `client/src/lib/conversion-data.ts`
- `client/src/lib/units/conversionFunctionRegistry.ts`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
- `client/src/data/conversion/temperature.json`
