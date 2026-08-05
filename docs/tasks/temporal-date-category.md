# Temporal-based Date/Datetime (calendar-system) category

> **Status (2026-08-05):** Ready to begin. Both prerequisites have
> landed: the SYMBOLIC-family framework and the Time zone pilot are
> live (commits `4f82004` through `afd2ee5`). This doc has been
> revised to reflect what was learned from the Time pilot and to
> firm up the previously-open questions. Design decisions preserved
> from the shared design brief; sequencing and scope firmed up here.

## Open questions from earlier drafts — now resolved

See [design-brief top-of-file status update](./temporal-calendar-timezone-design-brief.md) for the summary; full reasoning here.

**1. Split into `date_calendar` primary + `date_calendar_variant` categories, or one category with visual grouping?**

→ **One category, visual grouping inside the calendar dropdown.**

Reasoning: The Time pilot slotted 19 zones into one category with a single flat dropdown and it worked well. Date has 21 calendars — not much bigger. The design brief's own UX guidance ("UX pattern for dropdown") recommends `<optgroup>` inside a single Select for the Primary/Variants distinction. Two separate top-level categories would hide variants behind a discovery burden that the brief's variants-in-optgroup guidance explicitly rejects.

**Implementation note:** the shadcn/ui `<Select>` component may need extension to render section separators. If native `<optgroup>` semantics aren't easily supported, render section headers inside `<SelectContent>` as non-interactive labels above their group's items. Testable at 7a time.

**2. How does invalid input surface for Date? (Silent drop / framework error field / inline in result slot)**

→ **Inline in the result slot** (option C from the pilot review).

Reasoning: Date parsing has a much larger error surface than time parsing — users can type malformed input in many more ways, and "why is the result empty?" becomes mystifying. But adding a framework-level error field to SYMBOLIC categories is out of scope for the Date category itself. The middle path: when the parser returns null with a known error, print the error string as the result. Example: user has Common selected and types "-212", result field shows `"For BCE dates use '212 BCE', or select ISO 8601"` instead of just going blank.

**Cost:** trivial — the parser returns `{ date: null, errorMessage: string | null }` instead of just `null`, and `computeSymbolicConversion`'s Date branch returns the error message string when applicable. The output renderer already treats `symbolicResult` as a free-form string; no widget changes.

**Time-category retrospective:** the Time pilot uses silent-drop and it's fine for time strings because the parse-failure modes are narrow (`"25:00"` is obvious). Date's failure modes are diverse enough to warrant explanations. Leaving Time as silent-drop for now; may adopt inline-error later if consistency becomes a priority.

**3. Just date, or datetime with time-of-day?**

→ **Date-only for MVP.**

Reasoning: Datetime is a substantial additional widget (time-of-day field, PlainDateTime vs PlainDate handling, potential zone integration). It's an increment that can happen if demand emerges but doesn't need to be scoped in now. The date-only value is a `Temporal.PlainDate` in the from-calendar's backend.

**4. Numeral system control (Unicode `-u-nu-` extension exposed as a user option)?**

→ **Deferred indefinitely.** Rely on `Intl.DateTimeFormat`'s locale-default. App-wide `numberFormat` handles the analogous numeric case; adding a per-calendar numeral picker would be inconsistent. Adding it later is a small state addition; not painting ourselves into a corner.

**5. Year-zero / negative-year input in Common?**

→ **Reject with helpful inline error** (per resolution #2 above). Example errors:
- Input `"0"` with Common selected → `"Year 0 doesn't exist in Common. Use 1 BCE or 1 CE, or select ISO 8601 for astronomical years."`
- Input `"-212"` with Common selected → `"For BCE dates use '212 BCE', or select ISO 8601 to enter signed years."`
- Input `"212 BCE"` with ISO 8601 selected → `"ISO 8601 uses signed years. Try '-211'."`

## What & Why

A new category in the "Other" group of the converter UI, using
Temporal calendar tags as its "units." Users enter a date in the
from-calendar's convention and see it re-expressed in the
to-calendar. Common example: "2026-08-04 (Common) → 5786 Av 21
(Hebrew) → 1448 Safar 20 (Islamic)."

Scope resolved (see resolution #3 above): date-only for MVP.
Datetime with time-of-day is a possible future extension, not part
of the initial pilot.

## User model

- User picks a from-calendar and a to-calendar.
- User types a date in the from-calendar's expected format
  (e.g. "323 BCE" for Common, "-322" for ISO 8601, "5786 Av 21"
  for Hebrew).
- Result displays the same day expressed in the to-calendar with
  appropriate era labels.

## Unit registry

The 13-entry primary + 8-entry variant calendar registry from the
design brief. Copied here for reference; see brief for rationale:

**Primary:**
common, gregorian, julian, coptic, ethiopic, hebrew, islamic,
persian, chinese, japanese, roc, buddhist, indian.

**Variants:**
revised-julian, islamic-civil, islamic-tbla, islamic-astro,
islamic-rgsa, ethiopic-alem, dangi, iso8601.

Symbols use Temporal's calendar tag conventions (`common`,
`gregory`, `hebrew`, `islamic-umalqura`, etc.). Labels are
localized per the design brief's era/label authoring guidance.

## Conversion flow

```javascript
// Parse from-side input as a PlainDate in the from-calendar.
const fromDate = parseDate(userInput, fromCalendarId);  // custom per calendar

// Convert to the target calendar. Temporal's withCalendar handles this.
const toDate = fromDate.withCalendar(targetCalendarBackend);

// Format for display with the target calendar's era labels.
const display = formatDate(toDate, toCalendarId, language);
```

For Julian and Revised Julian (not in Temporal), the conversion
routes through Julian Day Number (JDN) at the from/to boundaries.
See the design brief for the Fliegel-Van Flandern converters.

## Where the complexity lives

1. **Parsing.** Common accepts "323 BCE", Gregorian accepts "323 BC",
   ISO 8601 accepts "-322", Hebrew accepts "5786 Av 21", Islamic
   accepts "1448 Safar 20"... each calendar has its own natural
   input convention. Per-calendar parser.

2. **Formatting.** `Intl.DateTimeFormat` handles most calendars
   automatically. Common (CE/BCE) requires authored labels because
   CLDR doesn't expose CE/BCE variants through Intl. Julian +
   Revised Julian require custom formatting because they route
   through JDN.

3. **Era labels.** See the design brief's ERA_LABELS table. Two
   styles (`ce-bce` and `ad-bc`) with authored labels for 8
   languages.

4. **Year-zero handling.** Common uses traditional numbering (no
   year 0); ISO 8601 uses astronomical (year 0 exists, negative
   years). Locked: dropdown-selects-parser per the design brief.
   Invalid combinations (year 0 or negative years in Common;
   BCE-labeled input in ISO 8601) reject with helpful inline errors
   per resolution #5 above.

5. **Julian / Revised Julian.** Temporal doesn't ship these; the
   design brief includes a ~80-line JDN-based module. Add as a
   separate script/module and route those two calendar backends
   through it.

## Localization

Follow the design brief's ERA_LABELS + CALENDAR_LABELS tables. 8
languages × 21 calendars ≈ 168 label strings plus era labels.
Authoring is manageable and gives consistency guarantees Intl
alone doesn't.

Per-locale word-order templates (≈8 short templates) may be needed
for fully idiomatic era-year output.

## What this does NOT need (initially)

- **Datetime with time-of-day**: open question. If date-only, no
  clock component; the value is a PlainDate. If datetime, the
  category widens to include a time-of-day field — possibly
  routing through the time-category widget. Recommendation: start
  date-only, add datetime as a follow-up.
- **Timezone interaction**: for date-only, no timezone concerns.
  For datetime, the time-of-day is zoneless (PlainDateTime, not
  ZonedDateTime) because the user is entering "6:30 PM on this
  date" not "6:30 PM Chicago time." Zoned time is the time-
  category's job.

## Category metadata

```json
{
  "id": "date_calendar",
  "name": "Date (Calendar)",
  "baseUnit": "common",
  "family": "SYMBOLIC",
  "units": [
    { "id": "common",    "name": "Common (CE/BCE)",        "symbol": "common" },
    { "id": "gregorian", "name": "Gregorian (AD/BC)",       "symbol": "gregory" },
    { "id": "julian",    "name": "Julian (E. Orthodox)",    "symbol": "julian" },
    ...
  ]
}
```

Same non-numeric shape as time_zone: no factor, no conversion
Function in the numeric registry. Conversion handled by a
SYMBOLIC-family branch in computeConversion, dispatched by
`activeCategory === 'date_calendar'` (or `'datetime_calendar'` if
datetime is scoped in).

Per resolution #1 in the top-of-file questions section: one
category `date_calendar` covering all 21 calendars (13 primary + 8
variants), with visual grouping inside the calendar dropdown to
separate primary from variants. Not two top-level categories.

## Sub-commit sequencing plan

Much bigger surface than the Time pilot; realistically 2–4 sessions
of work. Fine-grained decomposition below gives checkpointing.

**7a. Category registration — primary calendars only.** Add
`date_calendar` category as SYMBOLIC with 13 primary calendar
"units." All English labels; applied to all 11 locales as fallback.
Slot into the 'Other' group. No conversion behavior yet.

**7b. Visual grouping inside the calendar dropdown.** Assess
shadcn/ui `<Select>` capability for section separators; either
extend the component or render section-label divs inside
`<SelectContent>`. Small commit if the pattern is easy; may fold
into 7a if it turns out trivial.

**7c. Basic Temporal-backed conversion.** Wire
`computeSymbolicConversion` to dispatch on `activeCategory ===
'date_calendar'` → `computeDateConversion`. Handle the ~11
Temporal-supported calendars via `Temporal.PlainDate.withCalendar`.
Simple `YYYY-MM-DD` (ISO-shaped) input for all calendars initially
— per-calendar natural-format parsers land in 7e. Empty input
interprets as "today." Julian + Revised Julian deferred to 7f.

**7d. Behavior tests for 7c.** Pin the Temporal-backed conversions:
Common → Hebrew, Common → Islamic-Umalqura, Common → Persian, etc.
at fixed dates with known equivalents. Structural tests for
calendars that can't be pinned to fixed values (era-year composition,
month count, etc.).

**7e. Per-calendar natural-format parsers.** Common accepts "323
BCE", Gregorian accepts "323 BC", ISO 8601 accepts "-322", Hebrew
accepts "5786 Av 21", etc. Dispatch inside `parseDate(input,
fromCalendar, language)` on the from-calendar id. Each parser is
~30–50 lines. Return type: `{ date: PlainDate | null,
errorMessage: string | null }` per resolution #2.

**7f. Julian + Revised Julian JDN module.** New file at
`client/src/lib/temporal/julianJdn.ts` implementing the
Fliegel–Van Flandern converters per the design brief. Route the two
Julian calendars through this module at parse/format boundaries.
Include the Revised Julian leap rule.

**7g. Era-label formatting for Common.** CE/BCE labels authored in
`ERA_LABELS` per the design brief, since CLDR doesn't expose CE/BCE
variants through `Intl.DateTimeFormat`. Assemble output strings
manually using Temporal's `.era` and `.eraYear` fields plus
authored labels. Fixed word-order template initially
(`{eraYear} {eraLabel}` or `{eraLabel} {eraYear}`); per-locale
template variations only if needed.

**7h. Variant calendars.** Add the 8 variant calendars
(`revised-julian`, `islamic-civil`, `islamic-tbla`, `islamic-astro`,
`islamic-rgsa`, `ethiopic-alem`, `dangi`, `iso8601`) into the
registry and dropdown grouping. Some route to existing Temporal
backends; ISO 8601 uses its own parser that accepts signed years.

**7i. Localize calendar names + era labels.** 11 locales, ~275
strings total (calendar names: 21 × 11 = 231; era labels for the
authored styles: ~44). Analogous to Step 6 for timezones. Similar
localization script pattern.

**7j. Localize per-calendar error messages.** The parser errors
from 7e are English initially; translate to the other 10 locales in
a separate pass.

**Rough magnitude:** the Time pilot was 11 commits and ~500 lines
of production code. Date is realistically 2–3× that: 15–25 commits
and 1200–1500 lines, plus a similar volume of tests.

## Localization scope details

**Rely on `Intl.DateTimeFormat` for month names** in the 11
Temporal-supported calendars. Trust CLDR here — month-name authoring
for 21 calendars × 12 months × 11 locales would be ~2800 strings,
most of which CLDR already ships correctly.

**For Julian + Revised Julian, reuse Gregorian month names.** Both
use the same 12 Roman months (January through December), so
`gregory`'s CLDR month names apply unchanged.

**Author manually:**
- Calendar names (21 × 11 = 231 strings)
- Era labels for authored styles: `ce-bce` in all 11 locales (2
  labels × 11 = 22), plus `am`, `ah`, `ap`, `be`, `saka`, `minguo`,
  `am-mihret`, `am-alem` where CLDR doesn't cover them (est. another
  20–30 strings)
- Per-calendar parser error messages (est. 10–15 unique messages ×
  11 locales = 110–165 strings)

Total authored: ~400 strings. 2× the Time-category localization work;
feasible but not trivial.

**Word-order templates.** Some languages place the era before the
year ("CE 2026" style) and others after ("2026 CE" style). MVP: use
a single fixed template for all locales. If specific locales look
wrong, add per-locale overrides later. Not a blocker.

## Companion docs

- [temporal-calendar-timezone-design-brief.md](./temporal-calendar-timezone-design-brief.md)
  — shared design foundation. Read this for the full calendar
  registry, era-label authoring architecture, and Julian JDN
  converters.
- [symbolic-family-framework.md](./symbolic-family-framework.md)
  — the prerequisite framework work. Now implemented; historical
  reference.
- [temporal-time-category.md](./temporal-time-category.md) — the
  smaller pilot category. Now implemented; historical reference.
