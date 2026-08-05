# Temporal-based Time (timezone) category

> **Status:** future/aspirational. Not to be started before the
> [SYMBOLIC family framework](./symbolic-family-framework.md) is
> wired. Suitable pilot for that framework because time is a
> simpler symbolic conversion than calendar dates.

## What & Why

A new category in the "Other" group of the converter UI, using
IANA timezone identifiers as its "units." The "value" is implicit:
always the current instant (`Temporal.Now.instant()`). Conversion
means "express this instant in that timezone's local wall clock."

Default from-unit: **UTC**. Displays as the current UTC time.

## User model

- User picks a from-timezone (default UTC) and a to-timezone.
- The value field is either **hidden** (implicit 'now') or shows
  the current time in the from-zone as read-only.
- The result shows the current time in the to-zone.
- Optional refinement: an editable time-of-day field lets the user
  ask "if it's HH:MM in Berlin, what is it in Chicago?" This is
  the direction that would generalize the widget beyond pure 'now'.

Open question for the actual build: implicit-now-only, or make the
time-of-day editable? Editable is more useful; also more complex
because "now" needs an autofill button.

## Unit registry

Units are IANA timezone identifiers. Localized labels; symbols are
the IANA strings (`Europe/Berlin`, `America/Chicago`, `UTC`, ...).

The "common ones at top, uncommon collected at bottom" pattern from
the design brief applies: put major world timezones in the primary
section, put the long-tail of every IANA zone in a variants
section or a separate archaic-flavored category.

Draft primary set (adjust based on user demographics):

- UTC (default)
- America/New_York, America/Chicago, America/Denver,
  America/Los_Angeles, America/Anchorage, Pacific/Honolulu
- Europe/London, Europe/Berlin, Europe/Paris, Europe/Moscow
- Asia/Tokyo, Asia/Shanghai, Asia/Kolkata, Asia/Dubai
- Australia/Sydney
- Africa/Cairo, Africa/Johannesburg
- America/Sao_Paulo, America/Mexico_City

Long-tail variants: every other IANA zone. Approximately 400+ zones
via `Intl.supportedValuesOf('timeZone')`.

## Conversion flow

```javascript
// implicit-now case
const nowInstant = Temporal.Now.instant();  // computed each render/refresh
const fromDisplay = nowInstant.toZonedDateTimeISO(fromZone).toPlainTime();
const toDisplay   = nowInstant.toZonedDateTimeISO(toZone).toPlainTime();
```

For editable time-of-day, parse the user's input as a
`PlainTime` in the from-zone context, then adjust to the target
zone via `ZonedDateTime` (never bare `PlainTime`) to respect DST.
See design brief section "Zone-aware time flow" for the pitfall.

## Localization

- Timezone display: the IANA identifier as the symbol; the localized
  name (e.g. "\u4e2d\u90e8\u6a19\u6e96\u6642" for Asia/Tokyo in
  Japanese, "Zentraleurop\u00e4ische Zeit" for Europe/Berlin in
  German) via `Intl.DateTimeFormat` with `timeZoneName: 'long'`.
- Time-of-day format: 12-hour vs 24-hour per locale via
  `Intl.DateTimeFormat`.

## What this does NOT need

- No calendar system (use ISO 8601 / Gregorian implicitly).
- No era labels.
- No Julian conversion.
- No BCE date handling.

Which is why this is a good pilot for SYMBOLIC-family wiring \u2014
timezone is a much simpler symbolic conversion than calendar.

## Category metadata

```json
{
  "id": "time_zone",
  "name": "Timezone",
  "baseUnit": "UTC",
  "family": "SYMBOLIC",
  "units": [
    { "id": "utc", "name": "UTC", "symbol": "UTC" },
    { "id": "america_new_york", "name": "US/Eastern", "symbol": "America/New_York" },
    ...
  ]
}
```

No `factor` field (SYMBOLIC units don't have one). No `conversion
Function` in the numeric-registry sense; the whole category's
conversion is handled by a SYMBOLIC-family branch in
`computeConversion` that dispatches on `activeCategory ===
'time_zone'`.

## Open questions to defer

- Implicit-now vs editable time-of-day.
- How to handle DST transitions when user picks a time that falls
  in a "spring forward" gap or a "fall back" repeat.
- Whether to expose the IANA identifier or hide it in favor of the
  localized name only.
- Refresh cadence for 'now' \u2014 per-render, per-second, per-minute.
  A per-second refresh via `useEffect` is fine but requires a
  timer.

## Companion docs

- [temporal-calendar-timezone-design-brief.md](./temporal-calendar-timezone-design-brief.md)
  \u2014 shared design foundation.
- [symbolic-family-framework.md](./symbolic-family-framework.md)
  \u2014 the prerequisite framework work.
- [temporal-date-category.md](./temporal-date-category.md) \u2014 the
  larger companion category. Assumes both this and the framework
  are landed first.
