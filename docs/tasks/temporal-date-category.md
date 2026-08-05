# Temporal-based Date/Datetime (calendar-system) category

> **Status:** future/aspirational. Not to be started before both
> [SYMBOLIC family framework](./symbolic-family-framework.md) and
> [Time (timezone) category](./temporal-time-category.md) have
> landed. This is the larger of the two temporal converters.

## What & Why

A new category in the "Other" group of the converter UI, using
Temporal calendar tags as its "units." Users enter a date in the
from-calendar's convention and see it re-expressed in the
to-calendar. Common example: "2026-08-04 (Common) \u2192 5786 Av 21
(Hebrew) \u2192 1448 Safar 20 (Islamic)."

Open question (see below): whether to support just date, or full
datetime (date + time). Date-only is simpler.

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
   years). Decide up front: dropdown-selects-parser (recommended,
   per design brief) or user-toggle. The design brief recommends
   dropdown-selects-parser and locks that decision.

5. **Julian / Revised Julian.** Temporal doesn't ship these; the
   design brief includes a ~80-line JDN-based module. Add as a
   separate script/module and route those two calendar backends
   through it.

## Localization

Follow the design brief's ERA_LABELS + CALENDAR_LABELS tables. 8
languages \u00d7 21 calendars \u2248 168 label strings plus era labels.
Authoring is manageable and gives consistency guarantees Intl
alone doesn't.

Per-locale word-order templates (\u22488 short templates) may be needed
for fully idiomatic era-year output.

## What this does NOT need (initially)

- **Datetime with time-of-day**: open question. If date-only, no
  clock component; the value is a PlainDate. If datetime, the
  category widens to include a time-of-day field \u2014 possibly
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

Consider **splitting the primary and variants into two categories**
(per the user's phrasing in the design conversation: "possibly put
under the local/archaic as a separate converter"):

- `date_calendar` \u2014 primary calendars (Common, Gregorian, Julian,
  Coptic, Ethiopic, Hebrew, Islamic-Umalqura, Persian, Chinese,
  Japanese, ROC, Buddhist, Indian).
- `date_calendar_variant` \u2014 variants and specialized calendars
  (Revised Julian, Islamic variants, Ethiopic-Alem, Dangi, ISO 8601).

That gives users the same "declutter" affordance the archaic
categories have. `primaryCategory` metadata could link the variant
category to the primary one.

## Open questions (from the design brief, unresolved)

1. **Numeral system control.** Currently defaults to the language's
   canonical numeral system. Open: expose Unicode `-u-nu-` numbering
   as an independent user-selectable option?
2. **Year-zero or negative-year input in Common.** Reject as invalid
   with a helpful error? Interpret literally as astronomical?
   Interpret as traditional BCE? Design brief recommends reject-
   with-error.
3. **Just date, or datetime.** Open. Date-only is simpler and covers
   the most common use case; datetime is a follow-up if demand
   emerges.
4. **Whether to split into `date_calendar` primary + variant
   categories.** See the "consider splitting" note above.

## Companion docs

- [temporal-calendar-timezone-design-brief.md](./temporal-calendar-timezone-design-brief.md)
  \u2014 shared design foundation. Read this for the full calendar
  registry, era-label authoring architecture, and Julian JDN
  converters.
- [symbolic-family-framework.md](./symbolic-family-framework.md)
  \u2014 the prerequisite framework work.
- [temporal-time-category.md](./temporal-time-category.md) \u2014 the
  smaller pilot category. Landing that first exercises the SYMBOLIC
  framework wiring for a simpler case.
