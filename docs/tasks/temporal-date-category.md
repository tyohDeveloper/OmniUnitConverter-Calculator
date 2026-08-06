# Temporal-based Date/Datetime (calendar-system) category

> **Status (2026-08-05, evening — Step 7 MVP complete):** All 19
> registered calendars are functional in production. The Date category
> ships alongside Time as a second SYMBOLIC category. The complex
> per-calendar natural-format parser (7e) and its localized error
> messages (7j) were consciously deferred — the MVP accepts a single
> normalized input shape (`YYYY-MM-DD`) in the from-calendar's own
> year/month/day scheme, which covers the primary use case and keeps
> the parser surface small enough to defer safely.
>
> **What landed across commits `24f1981` through `0456ccb`:**
>
> - **7-preamble.** Switched polyfill import to `temporal-polyfill/full`.
>   Bundle 489.9 → 493.4 kB gzip (+3.5 kB). (`24f1981`)
> - **7a.** Registered `date_calendar` category with 13 primary
>   calendars. English fallbacks in all 12 locale files. Slotted into
>   the 'Other' group. Bumped `json-integrity` and `conversion-functions`
>   test category counts from 75 to 76. (`f355cfc`)
> - **7c.** Basic Temporal-backed conversion. `computeDateConversion`
>   dispatches through `Temporal.PlainDate.withCalendar` + `Intl.DateTimeFormat`.
>   Threaded `language` (a BCP-47 locale code, not just a language)
>   through `useConverterResultEffect` and `useConverterController`.
>   Empty input → today. (`7bc255c`)
> - **Three UX fixes.** Pre-populate `YYYY-MM-DD` on category switch,
>   hide the `symbol` prefix in the dropdown for `date_calendar` since
>   the symbol is the polyfill backend id (implementation detail), and
>   substitute CE/BCE for AD/BC in English Common output.
>   Shortened `Common (CE/BCE)` → `Common` and `Gregorian (AD/BC)` →
>   `Gregorian`. (`cd8faa8`)
> - **7d.** 40 behavior tests covering Common → 11 calendars at
>   `2026-08-05` with exact pinned strings (`22 Av 5786 AM`,
>   `Safar 22, 1448 AH`, `Mordad 14, 1405 AP`, `令和8年8月5日`,
>   `Sixth Month 23, 2026(bing-wu)`, etc.), reverse direction, BCE
>   dates, locale flow, unknown units, round-trips via Common. Also
>   discovered `Ś` in Śaka and that `Feb 31` clamps rather than throws
>   (polyfill uses `overflow: 'constrain'` by default). (`b98fea1`)
> - **7f.** Julian + Revised Julian JDN module
>   (`client/src/lib/temporal/julianJdn.ts`, 87 lines) implementing
>   Fliegel–Van Flandern converters, plus a companion parse+format
>   helper file (`computeJulianConversion.ts`, 74 lines). Revised
>   Julian is treated as Gregorian-equivalent within the
>   1600-03-01 to 2800-02-28 window and returns null outside.
>   Verified pivots: Common 2026-08-05 ↔ Julian 2026-07-23 (13-day
>   lag), Common 1582-10-15 ↔ Julian 1582-10-05, Common 2000-01-01 →
>   Julian 1999-12-19. Both new files added to `EXPORT_RULE_EXCLUDES`
>   in `scripts/lint-size.mjs` with documented rationale for the
>   multi-export exemption. (`472b356`)
> - **7g.** Per-locale CE/BCE substitution extracted to its own file
>   (`applyCommonEraLabels.ts`). Substitutes CLDR's Christian-era
>   abbreviations for religiously-neutral academic-convention labels
>   in en/en-us/ko (AD→CE/BC→BCE), de (n. Chr.→u. Z. / v. Chr.→v. u. Z.),
>   es (d. C.→e. c. / a. C.→a. e. c.), fr (ap. J.-C.→EC / av. J.-C.→AEC),
>   it (d.C.→E.V. / a.C.→A.E.V.), pt (d.C.→E.C. / a.C.→A.E.C.). No
>   substitution for ja/zh/ru/ar — CLDR already renders religiously-
>   neutral terms (西暦/紀元前, 公元/公元前, н. э./до н. э., م/ق.م).
>   Only fires when the target unit is `common`; Gregorian target
>   keeps CLDR's Christian-era labels unchanged, preserving the
>   Common vs. Gregorian distinction. (`48ff4ab`)
> - **7h.** Added the 6 variant calendars (`revised-julian`,
>   `islamic-civil`, `islamic-tbla`, `ethiopic-alem`, `dangi`,
>   `iso8601`). ISO 8601 gets its own formatter
>   (`computeIso8601Conversion.ts`) because Intl.DateTimeFormat cannot
>   format `iso8601` usefully — CLDR does not provide month or era
>   names for the iso8601 calendar, so Intl returns empty or garbled
>   strings. Direct formatting from the polyfill's year/month/day
>   fields produces a format-locked `YYYY-MM-DD` with signed years
>   for negative dates. Dropdown grouping via shadcn `SelectGroup` +
>   `SelectLabel` renders "Primary" and "Variants" section headers,
>   with the split determined by unit-id membership in a
>   `VARIANT_CALENDAR_IDS` set. Shared between input and output
>   selects via `renderCalendarGroupedItems.tsx`. UI translations for
>   "Primary" and "Variants" added to all 12 locale UI files. (`fda5ab8`)
> - **7i.** Localized all 19 calendar names into the 10 non-English
>   locales (`ar de es fr it ja ko pt ru zh`). 190 translations total.
>   Approach for each locale: use the established academic or CLDR
>   convention when available, keep the qualifying parenthetical in
>   the same shape as the registry key, and follow the target
>   language's calendar-naming tradition. The `Common` name includes
>   each locale's CE/BCE-equivalent abbreviation in parens (e.g.
>   `Zeitrechnung (u. Z./v. u. Z.)`, `Ère commune (EC/AEC)`,
>   `西暦（CE/BCE）`) to signal what era-label style users will see.
>   Also removed 6 stale short-form keys (`Julian`, `Coptic`, etc.)
>   accidentally added as identity-mapping fallbacks in step 7h
>   before the registry key shape was fully understood. (`0456ccb`)
>
> **Deferred (7e, 7j):**
>
> - **7e — complex natural-format parser.** Common would accept
>   `"323 BCE"`, Gregorian `"323 BC"`, ISO 8601 `"-322"`, Hebrew
>   `"5786 Av 21"`, Japanese `"令和8年8月5日"`, etc. The MVP's
>   `YYYY-MM-DD` normalized input is functional for the primary use
>   case ("what is today's date in the Hebrew calendar?" — user types
>   `2026-08-05` with Common as from, picks Hebrew as to, sees
>   `22 Av 5786 AM`). Complex per-calendar parsers can land as a
>   focused follow-up when the demand signal is clearer.
> - **7j — localized parser error messages.** Depends on 7e; skipped
>   with it.
>
> **Post-MVP hardening (0cbb899, 89db003):**
>
> - **Coptic/Ethiopic ERA1/ERA0 placeholder substitution** — Replit
>   noticed some browser CLDR builds render the literal placeholders
>   `ERA1` (post-epoch) or `ERA0` (pre-epoch) for the Coptic and
>   Ethiopic calendars when their era names aren't localized in the
>   bundled CLDR data. New file
>   `client/src/lib/calculator/applyFallbackEraLabels.ts` intercepts
>   these placeholders and substitutes conventional academic labels
>   (Coptic: `AM`/`BD`; Ethiopic: `AM`/`AA`; ethioaa single-era: `AA`
>   for both). Labels are Latin-script romanizations used across all
>   locales per the design brief's label-authorship policy for
>   calendars CLDR leaves untranslated. Node's current CLDR renders
>   these natively, so the module is defensive against older browser
>   Intl runtimes rather than fixing an observable bug in the test
>   environment. (`0cbb899`)
> - **Test coverage + two label corrections** for the fallback module.
>   13 new tests exercise the substitution mechanism via synthetic
>   `ERA1`/`ERA0` inputs (independent of whichever CLDR the test
>   runner bundles), covering no-op behavior for unrecognized
>   calendars, per-calendar substitutions, and locale-agnostic
>   application to CJK and Arabic RTL text. Also fixed two label
>   choices while auditing: Coptic ERA0 changed from `before AM`
>   (not a recognized academic convention) to `BD` (Before
>   Diocletian, the standard abbreviation); ethioaa ERA1 changed
>   from `AM` to `AA` (ethioaa is single-era Amätä Aläm, so both
>   ERA1 and ERA0 should map to `AA`, not to the ethiopic
>   incarnation-era label). (`89db003`)
>
> **Final metrics (main HEAD `89db003`):**
>
> - **Tests:** 2156 (was 2118 at start of Step 7 arc; +25 net across
>   7a/7c/7d/7f/7g/7h and +13 in post-MVP hardening).
> - **Bundle:** 498.8 kB gzip (was 493.9 kB after 7d, +4.9 kB across
>   7f/7g/7h/7i and post-MVP hardening). Under the 510.8 kB ceiling
>   with ~12 kB headroom.
> - **Categories:** 76 total (added `date_calendar`; kept the
>   19-zone `timezone` category from the Time pilot).
> - **Calendars:** 19 functional (13 primary + 6 variants).
>
> The rest of this document is preserved as the design record for
> what was decided and why, and to document the deferred parser
> scope.

> **Status (2026-08-05, morning):** Ready to begin. Both prerequisites
> have landed: the SYMBOLIC-family framework and the Time zone pilot
> are live (commits `4f82004` through `afd2ee5`). This doc has been
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

## Polyfill capability verified (2026-08-05)

Before starting 7a, `temporal-polyfill@1.0.3` was probed to confirm
which calendar backends it actually supports. Findings below.

**Polyfill entry point.** The default `import { Temporal } from
'temporal-polyfill'` ships only `gregory` and `iso8601`. The full
calendar set (Hebrew, Islamic, Coptic, etc.) requires the `/full`
subpath: `import { Temporal } from 'temporal-polyfill/full'`.

Bundle cost of switching to `/full`: **+3.5 kB gzipped** (measured
486.7 → 490.2 kB with the switch alone, no consumers). Well under
the 510.8 kB ceiling. Switch will land as its own preamble commit
before 7a so its bundle impact is separately attributable.

**Registry: 19 calendars, not 21.**

The brief lists 5 Islamic variants (`islamic-umalqura`, `islamic-
civil`, `islamic-tbla`, `islamic` astronomical, `islamic-rgsa` Saudi
sighting). The polyfill supports only the first three. The other
two are dropped:

- **`islamic` (astronomical)** requires live astronomical new-moon
  calculation. Beyond scope for an offline calendar converter.
- **`islamic-rgsa` (Saudi sighting)** is genuinely variable — depends
  on actual sighting data published by religious authorities.
  Impossible to bundle statically.

Final registry (13 primary + 6 variants = 19):

**Primary (13):** `common`, `gregorian`, `julian`, `coptic`,
`ethiopic`, `hebrew`, `islamic`, `persian`, `chinese`, `japanese`,
`roc`, `buddhist`, `indian`.

**Variants (6):** `revised-julian`, `islamic-civil`, `islamic-tbla`,
`ethiopic-alem`, `dangi`, `iso8601`.

**Polyfill era codes (source of truth, not the brief's `eraStyle`).**

Pin the actual polyfill era-field values as our lookup keys, since
the brief's abstract `eraStyle` names don't always match:

| Calendar | Polyfill backend | `era` value | `eraYear` | Our label |
|---|---|---|---|---|
| `common` | `gregory` | `ce` / `bce` | ✓ | "CE" / "BCE" |
| `gregorian` | `gregory` | `ce` / `bce` | ✓ | "AD" / "BC" |
| `julian` | (custom-jdn) | (assembled) | ✓ | "AD" / "BC" |
| `coptic` | `coptic` | `am` | ✓ | "AM" |
| `ethiopic` | `ethiopic` | `am` | ✓ | "AM (Mihret)" |
| `ethiopic-alem` | `ethioaa` | `aa` | ✓ | "AM (Alem)" |
| `hebrew` | `hebrew` | `am` | ✓ | "AM" |
| `islamic` | `islamic-umalqura` | `ah` | ✓ | "AH" |
| `islamic-civil` | `islamic-civil` | `ah` | ✓ | "AH" |
| `islamic-tbla` | `islamic-tbla` | `ah` | ✓ | "AH" |
| `persian` | `persian` | `ap` | ✓ | "AP" |
| `chinese` | `chinese` | `undefined` | (uses `year`) | (see below) |
| `dangi` | `dangi` | `undefined` | (uses `year`) | (see below) |
| `japanese` | `japanese` | `reiwa`/`heisei`/... | ✓ | localized era name |
| `roc` | `roc` | `roc` | ✓ | "民國" / "Minguo" |
| `buddhist` | `buddhist` | `be` | ✓ | "BE" |
| `indian` | `indian` | `shaka` | ✓ | "Shaka" (not Saka; matches polyfill) |
| `revised-julian` | (custom-jdn) | (assembled) | ✓ | "AD" / "BC" |
| `iso8601` | `iso8601` | `undefined` | (uses `year`) | (no era; signed year) |

Note that Coptic, Ethiopic (both variants), and Hebrew all return
the same era code `am` (Anno Martyrum / Mihret / Mundi), but the
labels are distinct because they're keyed off the calendar id, not
the era code alone. Ethiopic-Alem correctly returns `aa` from the
`ethioaa` backend, giving us a natural distinction.

**Chinese and Dangi rendering.**

These calendars don't have a linear era — they use a 60-year
sexagenary stem-branch cycle. `Intl.DateTimeFormat` returns
additional fields `relatedYear` and `yearName` (e.g. `2026` and
`bing-wu`). Display convention: **render both, with stem-branch in
parentheses.** Rationale: the numeric year alone is ambiguous (any
2026 could be any of infinitely many years in the 60-year cycle);
the stem-branch alone requires cultural context. Both together is
unambiguous for correspondence use.

Example output for 2026 CE:
- Chinese: `2026 (丙午)` (in `zh` locale) or `2026 (bing-wu)` (in
  romanized locales like `en`)
- Dangi: `2026 (병오)` (in `ko`) or `2026 (byeong-o)` (romanized)

**ISO 8601 output shape.**

For `iso8601` calendar, render as full **`YYYY-MM-DD`** date, using
signed years for BCE dates (e.g. `-0321-01-15` for 322 BCE). This
preserves ISO 8601's unambiguous exchange-format role. Year alone
would lose the day-level precision that other calendars display.

**JSON schema for the registry.**

Flat structure matching existing categories. The dispatch code keys
off the calendar id to detect custom-module cases:

```json
{
  "id": "hebrew",
  "name": "Hebrew",
  "symbol": "hebrew",
  "factor": 1
}
```

The `symbol` field carries the polyfill backend ID for calendars
that use one; for `julian` and `revised-julian` the symbol is our
logical id and dispatch routes through the custom JDN module. The
`factor: 1` is dead data (same as timezone units) since SYMBOLIC
categories don't do arithmetic. `unitType` and `measurementSystem`
follow the timezone pattern (`SI_BASE`, `SI`) as placeholders.

**What's NOT yet probed** (relevant for later sub-steps, not 7a):

- Month-name variability across calendars (Hebrew's intercalary
  Adar, Chinese leap months). Affects the formatter.
- Date arithmetic (`.add({ days: 365 })`) across all calendars.
  Not needed for pure conversion display.
- Julian ↔ Gregorian 1582 gap semantics. Custom JDN module handles
  this trivially since JDN is a monotonic count.

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

**7-preamble. Switch polyfill import to `/full`.** One-line change
to `client/src/lib/temporal/temporal.ts` swapping `temporal-
polyfill` for `temporal-polyfill/full`. Bundle +3.5 kB gzip.
Baseline stays put (still under ceiling). Isolated from the Date
category work so the bundle cost is separately attributable.

**7a. Category registration — primary calendars only.** Add
`date_calendar` category as SYMBOLIC with 13 primary calendar
"units." All English labels; applied to all 11 locales as fallback.
Slot into the 'Other' group. No conversion behavior yet.

**7b. Visual grouping inside the calendar dropdown.** Render two
section-label divs ("Primary" and "Variants") as non-interactive
headers inside `<SelectContent>`, above their respective groups.
No `<optgroup>` semantics needed — with 19 units this is small
enough that a flat list with visual dividers works fine. Simplest
implementation; folds into 7h when the variants group first has
content, since 7a ships primary calendars only.

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

**7h. Variant calendars.** Add the 6 variant calendars
(`revised-julian`, `islamic-civil`, `islamic-tbla`, `ethiopic-alem`,
`dangi`, `iso8601`) into the registry and dropdown grouping. Some
route to existing Temporal backends; ISO 8601 uses its own parser
that accepts signed years. `islamic` (astronomical) and
`islamic-rgsa` (Saudi sighting) are dropped from the brief's list
per the polyfill capability review — they can't be supported
offline without astronomical or sighting-data resources.

**7i. Localize calendar names + era labels.** 11 locales. Calendar
names: 19 × 11 = 209 strings. Era labels for the authored styles
(`ce-bce`, `ad-bc`, `am`, `am-mihret`, `am-alem`, `ah`, `ap`, `be`,
`shaka`, `roc`) across 11 locales: ~50–80 strings depending on
how many need authoring vs. how many CLDR provides via Intl.
Analogous to Step 6 for timezones. Similar localization script
pattern.

**7j. Localize per-calendar error messages.** The parser errors
from 7e are English initially; translate to the other 10 locales in
a separate pass.

**Rough magnitude:** the Time pilot was 11 commits and ~500 lines
of production code. Date is realistically 2–3× that: 15–25 commits
and 1200–1500 lines, plus a similar volume of tests. The reduced
registry (19 vs 21 calendars) trims translation work modestly but
doesn't materially shrink implementation.

## Localization scope details

**Rely on `Intl.DateTimeFormat` for month names** in the polyfill-
supported calendars. Trust CLDR here — month-name authoring for 19
calendars × 12 months × 11 locales would be ~2500 strings, most of
which CLDR already ships correctly.

**For Julian + Revised Julian, reuse Gregorian month names.** Both
use the same 12 Roman months (January through December), so
`gregory`'s CLDR month names apply unchanged.

**Author manually:**
- Calendar names (19 × 11 = 209 strings)
- Era labels for authored styles where CLDR doesn't cover them
  well: `ce-bce` (2 × 11 = 22), plus per-need for `am`, `am-mihret`,
  `am-alem`, `ah`, `ap`, `be`, `shaka`, `roc` (est. 30–60 more)
- Per-calendar parser error messages (est. 10–15 unique messages ×
  11 locales = 110–165 strings)

Total authored: ~350–450 strings. Similar order of magnitude to 2×
the Time-category localization work; feasible but not trivial.

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
