# Temporal + Calendar + Timezone: Design Brief

> **Status update (2026-08-05):** The SYMBOLIC-family framework is
> live in OmniUnitConverter, and the Time zone pilot has landed in a
> series of commits from `4f82004` through `afd2ee5`. This section
> summarizes what changed since the original 2026-08-04 scope note
> and updates a few decisions that turned out differently in
> practice than the brief anticipated. The design-brief body below
> is preserved as the reference for calendar registry, era labeling,
> Julian JDN converters, and localization architecture; the Date
> category work will build on it directly.
>
> **What's landed:**
>
> - `temporal-polyfill` (FullCalendar) inlined via a source-selection
>   shim at `client/src/lib/temporal/temporal.ts`. Bundle cost:
>   ~20.8 kB gzipped, matching the brief's forecast. Migration to
>   native `Temporal` is a one-line change to that file.
> - SYMBOLIC family threaded through the converter pipeline:
>   parallel `symbolicResult: string | null` state field,
>   family-dispatched `computeConversion` → `computeSymbolicConversion`,
>   family-aware input/output widgets. The calculator layer stays
>   100% numeric via a centralized `canPushToCalculator` gate that
>   rejects SYMBOLIC pushes silently.
> - Time zone category with 19 zones covering all inhabited
>   continents, English + 10 non-English locales (es fr de it pt ru
>   ja ko zh ar), Temporal-backed conversion with day-shift
>   annotations (`+1d` / `-1d`), and an extended parser that reads
>   `HH:MM ZONE` inputs and updates both fields on blur or Enter.
> - 2074 tests total (up from 1963 at the start of the arc), of
>   which 111 pin SYMBOLIC-framework and Time-category behavior.
>
> **Decisions that landed differently than the brief anticipated:**
>
> - **File format.** The brief locked "XHTML strict, CDATA-wrapped
>   script blocks." OmniUnitConverter's single-file build is HTML5
>   via Vite — no CDATA wrapping needed. The corresponding section
>   in this brief ("Single-file XHTML build considerations") is
>   obsolete for this codebase and can be ignored.
> - **Locale count.** The brief assumed 8 supported languages;
>   OmniUnitConverter ships 11 (`ar de en en-us es fr it ja ko pt ru
>   zh`). Translation authoring for Date should target all 11.
>   `en-us` shares `en` for name strings (differs only on
>   orthography like meter/metre); no separate authoring needed.
> - **Custom Julian module path.** The brief describes it as a
>   separate `<script>` block in the single-file build. In
>   OmniUnitConverter it will be a normal module under
>   `client/src/lib/temporal/julianJdn.ts`, imported by the Date
>   category's per-calendar dispatch.
>
> **Decisions previously open, now firmed up (see the Date-category
> doc for the full reasoning):**
>
> - Numeral system control — **deferred indefinitely.** Rely on Intl
>   locale-default. App-wide `numberFormat` already handles the
>   analogous numeric case; adding a per-calendar numeral picker
>   would be inconsistent.
> - Year-zero / negative-year input in Common — **reject with
>   helpful inline error.** The error text is printed in the result
>   field slot rather than a toast, since the SYMBOLIC framework
>   currently has no error-message plumbing.
> - Just date or datetime — **date-only for MVP.** Datetime is a
>   possible future extension.
> - Primary + variants split — **one category with visual grouping
>   inside the calendar dropdown**, not two top-level categories.
>   The brief's own `<optgroup>` guidance supports this.
>
> **Companion docs:**
>
>   - [symbolic-family-framework.md](./symbolic-family-framework.md)
>     — the framework-widening prerequisite. Now implemented; kept
>     as historical scope reference.
>   - [temporal-time-category.md](./temporal-time-category.md) — the
>     timezone pilot. Now implemented; kept as historical scope
>     reference.
>   - [temporal-date-category.md](./temporal-date-category.md) — the
>     calendar converter. Actionable next-work document; has its own
>     status header with pilot-informed sequencing.

---

Design decisions and rationale for a browser-only, offline calendar/timezone tool. Originally scoped to a standalone single-file XHTML build; the calendar/time architectural decisions below apply unchanged to OmniUnitConverter, which is the actual carrier.

## Deployment constraints

- **Single-file XHTML**, standards-compliant, distributed as one `.xhtml` file
- **Offline / no network** at runtime — no CDN, no external assets, no persistence
- **Browser & OS independent** — same file must behave identically across environments
- **Target: post-2020 browsers** (ES2020 baseline: optional chaining, nullish coalescing, BigInt)
- **User-facing localization**: 8 pre-chosen languages
- **Rebuild strategy**: new app version = deliberately chosen new library versions

## Runtime library choice

### Use `temporal-polyfill` (FullCalendar), always, inlined

- npm: `temporal-polyfill`
- Repo: `github.com/fullcalendar/temporal-polyfill`
- Size: ~70 KB minified (~20 KB gzipped)
- Import: `import { Temporal } from 'temporal-polyfill'`

### Not `@js-temporal/polyfill`

The TC39 reference polyfill is ~154 KB minified (~44 KB gzipped) and still in alpha (v0.5.1 as of ~March 2026). FullCalendar's polyfill is roughly half the size, is production-battle-tested inside FullCalendar v7, and has near-perfect spec compliance with 4 documented intentional deviations.

### Always use polyfill, ignore native Temporal even when present

Import Temporal as a module-scoped binding from the polyfill; never reference `window.Temporal`. Rationale:

1. **Consistency across browsers** is worth more than 20 KB of "redundant" runtime. One implementation to test, one set of edge-case behaviors.
2. **Early native implementations have bugs** — Chrome 144 (Jan 2026) and Firefox 139 (May 2025) are first shipping versions. The polyfill has ~5 years of maturity.
3. **You control the update cadence** — rebuilding with a new polyfill version is deliberate. Native changes under you when browsers update, on a schedule you don't control.
4. **Perf differences don't matter** for correspondence-scale usage (hundreds of Temporal ops per session, not millions).

Migration path: when your minimum browser target has native Temporal everywhere, drop the polyfill and use `window.Temporal`. The application code doesn't change — only the build config.

## Temporal type usage

Use each Temporal type for the semantic role it represents:

| Use case | Temporal type |
|---|---|
| CE/BCE calendar dates | `Temporal.PlainDate` with `[u-ca=gregory]` |
| Non-Gregorian calendar dates | `Temporal.PlainDate` with appropriate `[u-ca=...]` |
| Correspondence "what time is it now in Berlin?" | `Temporal.Now.zonedDateTimeISO('Europe/Berlin')`, display via `.toPlainTime()` |
| Log/email/phone timestamps (in-memory) | `Temporal.Instant` |
| Scheduled events, meeting times | `Temporal.ZonedDateTime` |
| Time-only display | Derive from `ZonedDateTime`, don't use bare `PlainTime` |

### Do not use `PlainTime` for zoned time-of-day

`PlainTime` is a zoneless wall-clock time (e.g. "the shop opens at 9:00 every day"). If you use it for "current time in Berlin" then apply an offset, you'll be wrong twice a year around DST transitions and around fall-back / spring-forward weekends. Always route zone-aware time through `ZonedDateTime` and display `.toPlainTime()` only for rendering.

## Calendar architecture

### Two independent axes

| Axis | What it controls | How specified |
|---|---|---|
| **Calendar** | Which reckoning system (year length, month structure, era, leap rules) | `Temporal.PlainDate` calendar tag, e.g. `[u-ca=hebrew]` |
| **Locale (language)** | Display strings (month names, weekday names, era labels, numerals) | `Intl.DateTimeFormat` locale argument, e.g. `'ar-EG'` |

These compose freely. A user can pick "Hebrew calendar, English language" or "Gregorian calendar, Arabic language" — Temporal + Intl handle any combination.

### CE/BCE vs AD/BC — same calendar, different labels

Both are the same `gregory` calendar with the same arithmetic. They differ only in era terminology. The registry treats them as two labeled views of one backend:

```js
{ id: 'common',    backend: 'gregory', eraStyle: 'ce-bce', group: 'primary' }
{ id: 'gregorian', backend: 'gregory', eraStyle: 'ad-bc',  group: 'primary' }
```

Zero risk of divergent arithmetic — you're just swapping era-label strings at render time.

### `gregory` vs `iso8601` — pick `gregory` for user-facing use

Both are proleptic Gregorian. They differ in year numbering:

- `iso8601`: astronomical year numbering, year 0 exists. `-322` = 323 BCE. No era fields.
- `gregory`: traditional numbering, no year 0. `.era='bce'`, `.eraYear=323` for the same date.

For a user-facing app with CE/BCE as a first-class concept, use `gregory` — your display code gets `.era` and `.eraYear` directly rather than having to detect negative years and translate.

**Watch the year-zero off-by-one**: user enters "323 BCE" → ISO signed year is `-322`. Decide up front whether input parsing accepts traditional ("323 BCE") or astronomical ("-322") year values.

### Full calendar registry

```js
const CALENDARS = [
  // Primary
  { id: 'common',    backend: 'gregory',          eraStyle: 'ce-bce',    group: 'primary' },
  { id: 'gregorian', backend: 'gregory',          eraStyle: 'ad-bc',     group: 'primary' },
  { id: 'julian',    backend: 'custom-julian',    eraStyle: 'ad-bc',     group: 'primary' },
  { id: 'coptic',    backend: 'coptic',           eraStyle: 'am',        group: 'primary' },
  { id: 'ethiopic',  backend: 'ethiopic',         eraStyle: 'am-mihret', group: 'primary' },
  { id: 'hebrew',    backend: 'hebrew',           eraStyle: 'am',        group: 'primary' },
  { id: 'islamic',   backend: 'islamic-umalqura', eraStyle: 'ah',        group: 'primary' },
  { id: 'persian',   backend: 'persian',          eraStyle: 'ap',        group: 'primary' },
  { id: 'chinese',   backend: 'chinese',          eraStyle: null,        group: 'primary' },
  { id: 'japanese',  backend: 'japanese',         eraStyle: 'japanese',  group: 'primary' },
  { id: 'roc',       backend: 'roc',              eraStyle: 'minguo',    group: 'primary' },
  { id: 'buddhist',  backend: 'buddhist',         eraStyle: 'be',        group: 'primary' },
  { id: 'indian',    backend: 'indian',           eraStyle: 'saka',      group: 'primary' },

  // Variants — shown grouped in dropdown, same registry
  { id: 'revised-julian', backend: 'custom-rjulian', eraStyle: 'ad-bc',   group: 'variant' },
  { id: 'islamic-civil',  backend: 'islamic-civil',  eraStyle: 'ah',      group: 'variant' },
  { id: 'islamic-tbla',   backend: 'islamic-tbla',   eraStyle: 'ah',      group: 'variant' },
  { id: 'islamic-astro',  backend: 'islamic',        eraStyle: 'ah',      group: 'variant' },
  { id: 'islamic-rgsa',   backend: 'islamic-rgsa',   eraStyle: 'ah',      group: 'variant' },
  { id: 'ethiopic-alem',  backend: 'ethioaa',        eraStyle: 'am-alem', group: 'variant' },
  { id: 'dangi',          backend: 'dangi',          eraStyle: null,      group: 'variant' },
  { id: 'iso8601',        backend: 'iso8601',        eraStyle: null,      group: 'variant' },
];
```

## Calendar labeling — do these carefully

- **"Common"** — CE/BCE labels, religiously neutral. Default.
- **"Gregorian"** — AD/BC labels, traditional Christian era. Same backend as Common.
- **"Julian (Eastern Orthodox)"** — for Russian, Serbian, Georgian, Jerusalem, Old Calendar. Currently 13 days behind Gregorian (until 2100). Requires custom module.
- **"Coptic (Oriental Orthodox)"** — Coptic Orthodox and Coptic Catholic. Do NOT label just "Orthodox" — Coptic is Oriental Orthodox, not Eastern.
- **"Ethiopic (Ethiopian/Eritrean Orthodox)"** — shared calendar for both Ethiopian and Eritrean Tewahedo churches. Do NOT label just "Tewahedo" (means "unity," identifies theology not calendar).
- **"Islamic (Umm al-Qura)"** — Saudi official, most common Islamic default.
- **Islamic variants** (`islamic-civil`, `islamic-tbla`, `islamic`, `islamic-rgsa`) — advanced/scholarly. Put in variants group.

### Orthodox calendar landscape (why the specific choices)

- **Coptic ≠ Russian Orthodox.** Three distinct systems: Coptic (Oriental Orthodox, Egypt), Ethiopic (Oriental Orthodox, Ethiopia/Eritrea), Julian (Eastern Orthodox, Russian/Serbian/etc.). Temporal ships the first two natively; Julian requires custom code.
- **Revised Julian is identical to Gregorian from 1 March 1600 through 28 February 2800.** For a correspondence app essentially 100% of dates fall in that window, so a separate "Revised Julian" option is computationally redundant with Gregorian. Include it only as a variant for users who specifically want their tradition acknowledged; label with a note explaining the equivalence.
- **Chalcedonian Orthodox using Revised Julian for fixed feasts** (Constantinople, Greek, Antiochian, Bulgarian, Romanian, OCA, Ukrainian since 2023) compute Pascha via the Julian Paschalion — that's a separate algorithm (Meeus/Jones/Butcher for Gregorian Pascha, Gauss for Julian). Out of scope for correspondence.

## Islamic tabular variants — reference

For future extension. All share 12 alternating 30/29-day months, 30-year cycle with 11 leap years at [2,5,7,10,13,16,18,21,24,26,29], leap day on month 12. Differ by epoch:

| ID | Full name | Epoch | Use |
|---|---|---|---|
| `islamic-civil` | Tabular, Friday epoch | 16 Jul 622 CE Julian | General civil computation, "Kuwaiti algorithm" |
| `islamic-tbla` | Tabular, Thursday epoch ("astronomical") | 15 Jul 622 CE Julian | Microsoft Hijri Calendar, academic |
| `islamic` | Astronomical (not tabular) | Computed per lunar phase | Astronomical new-moon calculation |
| `islamic-umalqura` | Umm al-Qura | Modern calculated | Saudi official (recommended default) |
| `islamic-rgsa` | Saudi sighting | Actual sighting | Religious observance, Saudi Arabia (variable) |

## Custom Julian / Revised Julian module

Temporal's spec removed custom calendar registration — calendars are string IDs only. Julian and Revised Julian require conversion at your display/input boundaries via Julian Day Number (JDN) as the pivot representation.

### Fliegel-Van Flandern JDN converters (canonical)

```js
// Gregorian date → JDN
function gregorianToJDN(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy
         + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

// Julian date → JDN
function julianToJDN(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy
         + Math.floor(yy / 4) - 32083;
}

// JDN → Julian date
function jdnToJulian(jdn) {
  const c = jdn + 32082;
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

// JDN → Gregorian date
function jdnToGregorian(jdn) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor(146097 * b / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}
```

### Revised Julian leap year rule

```js
function isRevisedJulianLeap(year) {
  if (year % 4 !== 0) return false;
  if (year % 100 !== 0) return true;
  const r = year % 900;
  return r === 200 || r === 600;
}
```

The Revised Julian JDN converters follow the same shape as Julian's but with this leap rule substituted. Offset from Gregorian is zero for 1600-03-01 through 2800-02-28 CE.

### Total custom-module cost

- JDN converter pair (Gregorian ↔ JDN, Julian ↔ JDN): ~40 lines
- Revised Julian variant (~20 more lines)
- Total: ~80 lines including tests. Written once, works for both Julian variants.

## Localization architecture

Two data structures, cleanly separated:

```js
// Stable, canonical, never translated — these are Unicode BCP-47 keys
const CALENDARS = [ /* see registry above */ ];
const LANGUAGES = ['en', 'es', 'fr', 'de', 'ja', 'ar', 'he', 'zh'];  // your 8

// Localized labels — you author these
const CALENDAR_LABELS = {
  'common':   { en: 'Common', es: 'Común', fr: 'Commun', /* ... */ },
  'hebrew':   { en: 'Hebrew', es: 'Hebreo', he: 'עברי', /* ... */ },
  // ...
};

const ERA_LABELS = {
  'ce-bce': {
    en: { ce: 'CE', bce: 'BCE' },
    es: { ce: 'e.c.', bce: 'a.e.c.' },
    fr: { ce: 'EC', bce: 'AEC' },
    de: { ce: 'u.Z.', bce: 'v.u.Z.' },
    // ...
  },
  'ad-bc': {
    en: { ce: 'AD', bce: 'BC' },
    es: { ce: 'd.C.', bce: 'a.C.' },
    fr: { ce: 'ap. J.-C.', bce: 'av. J.-C.' },
    de: { ce: 'n. Chr.', bce: 'v. Chr.' },
    // ...
  },
};
```

### Author labels yourself; do not rely on browser defaults

You could pull calendar names from `Intl.DisplayNames`, and era names from `Intl.DateTimeFormat` with an `era` option. Both work but:

- CLDR English defaults to BC/AD, not BCE/CE
- CLDR's calendar names may be shorter or differently-worded than your UI style guide
- Custom calendars (Julian) have no CLDR entry
- Explicit labels give consistency across all 8 languages

With 8 languages × ~21 calendars, you're authoring ~168 label strings plus era labels. Manageable and worth the control.

### Numbering system as a possible third axis

`Intl.DateTimeFormat` handles numeral system via the `-u-nu-` locale extension: `'ar-EG-u-nu-latn'` (Western digits) vs `'ar-EG-u-nu-arab'` (Arabic-Indic). Usually implicit in locale choice. Out of scope for correspondence unless users want explicit control.

## UX pattern for dropdown

**Use HTML `<optgroup>` with two groups: "Primary" and "Variants".** Rationale:

- Zero JavaScript state to manage
- All options visible (transparency) but visual hierarchy guides users
- Screen readers announce group names (a11y win)
- Native browser rendering, works everywhere

```html
<select id="calendar">
  <optgroup label="Calendar">
    <option value="common">Common</option>
    <option value="gregorian">Gregorian</option>
    <option value="julian">Julian (Eastern Orthodox)</option>
    <!-- ... primary group ... -->
  </optgroup>
  <optgroup label="Variants">
    <option value="revised-julian">Revised Julian</option>
    <option value="islamic-civil">Islamic (tabular civil)</option>
    <!-- ... variants group ... -->
  </optgroup>
</select>
```

Rejected alternatives:
- **Toggle to show/hide variants**: strands users who don't know to enable it
- **Separate tool for variants**: adds discovery burden without functional benefit

## Timezone architecture

### Rely on browser's IANA tzdb via Intl

Both native Temporal and both polyfills use the browser's built-in Intl implementation for timezone data. You don't ship tzdb yourself. Implication: your app inherits whatever tzdb version the user's browser has (updates ~quarterly by IANA, browsers pick up on their own cycle).

**Not a problem in practice** for correspondence: rule changes are announced months in advance and affect obscure zones. Chicago ↔ Berlin ↔ Tokyo rules haven't changed in years.

**Alternative if you ever need a hermetically-sealed tzdb**: bundle moment-timezone-style tzdb JSON (~200 KB minified) and do zone math in userland. Almost certainly not worth it for this use case.

### Zone-aware time flow

```js
// "What time is it now in Berlin?" — correspondence use case
const nowBerlin = Temporal.Now.zonedDateTimeISO('Europe/Berlin');
nowBerlin.toPlainTime().toString();  // "14:35:22"

// Log/email/phone timestamp — in-memory only (no persistence in your app)
const stamp = Temporal.Now.instant();
stamp.toString();  // "2026-08-05T00:54:12.345678901Z"

// Display timestamp in user's local zone
stamp.toZonedDateTimeISO('America/Chicago').toPlainTime();

// Scheduled meeting across zones
const meeting = Temporal.ZonedDateTime.from('2026-11-01T14:30[Europe/Berlin]');
meeting.withTimeZone('America/Chicago');  // DST-correct
```

## Serialization

- Temporal's ISO 8601 output (via `.toString()`) is compatible with RFC 9557, which extends ISO 8601 with IANA zone tags (`[Europe/Berlin]`) and calendar tags (`[u-ca=hebrew]`).
- Round-trip: `Temporal.PlainDate.from(date.toString())` reconstructs the object.
- No persistence in your app means this only matters for in-memory serialization or debugging output.

## Single-file XHTML build considerations

> **Obsolete for OmniUnitConverter.** This section applied to the
> original standalone-XHTML scope. OmniUnitConverter uses an HTML5
> single-file build via Vite, which handles inlining and script
> encoding automatically — no CDATA wrapping, no separate inline
> script blocks. The polyfill import at
> `client/src/lib/temporal/temporal.ts` is a normal module import;
> Vite bundles it into the app's main script. Retained below for
> historical reference only.

### XHTML strict script wrapping

XHTML parses `<script>` content as XML by default, so `<`, `>`, `&` in JavaScript will break parsing. Wrap script contents in CDATA using the JS-comment guard pattern:

```xhtml
<script type="text/javascript">
//<![CDATA[
  // polyfill code here
//]]>
</script>

<script type="text/javascript">
//<![CDATA[
  // app code here
//]]>
</script>
```

Alternatively, consider whether HTML5 (which parses `<script>` as raw text) is acceptable — much easier for inlined JS. Only stick with XHTML strict if there's a hard reason.

### Inline structure

1. `temporal-polyfill` bundled — one script block, CDATA-wrapped
2. Custom Julian/Revised Julian module — one script block, CDATA-wrapped
3. Application code — one script block, CDATA-wrapped

Total inlined size estimate:
- Polyfill: ~70 KB minified
- Custom calendar module: ~2-3 KB
- Application code + labels: your choice

## Summary of concrete decisions

| Decision | Choice | Reason |
|---|---|---|
| Date/time library | Temporal via `temporal-polyfill` (FullCalendar) | Standards-aligned, smaller than reference polyfill |
| Polyfill loading | Inlined, always used | Consistency across browsers, controlled update cadence |
| Default calendar | `gregory` (backing `common`) | Era fields for CE/BCE display |
| Correspondence time | `ZonedDateTime` → `.toPlainTime()` for display | DST-safe, avoids `PlainTime` pitfalls |
| Timestamps | `Temporal.Instant` | In-memory only; no persistence in this app |
| Non-Gregorian calendars | Temporal built-ins for 11, custom for Julian + Revised Julian | Coverage of major traditions, minimal custom code |
| Orthodox coverage | Julian (Eastern), Coptic (Oriental), Ethiopic (Oriental) as primary; Revised Julian as variant | Reflects actual liturgical usage; RJ is Gregorian-equivalent for all realistic dates |
| Ethiopic label | "Ethiopic (Ethiopian/Eritrean Orthodox)" | Same calendar for both Tewahedo churches; label is calendar-accurate, not theological |
| CE/BCE vs AD/BC | Two labeled views of same `gregory` backend | Cultural sensitivity, zero arithmetic risk |
| Localization axes | Calendar (BCP-47 keys) × Language (8 locales) — independent | Compose freely via Intl + Temporal |
| Label authorship | Custom label table, not `Intl.DisplayNames` | Consistency, custom calendars, terminology control |
| Dropdown pattern | `<optgroup>` with Primary and Variants sections | Native, stateless, accessible |
| File format | XHTML strict, CDATA-wrapped script blocks | Committed requirement |
| ISO 8601 as separate dropdown entry | Yes, in Variants group | Establishes astronomical-year input convention per dropdown selection; eliminates parsing ambiguity |
| Custom calendar module | Separate inline `<script>` block | Isolates Julian/Revised Julian JDN code from main app |

## Locked decisions (previously open)

- **File format**: XHTML strict. Wrap all script contents in CDATA using the JS-comment guard pattern shown above.
- **Custom calendar module location**: separate `<script>` block, cleanly isolated from main app script.
- **Input parsing per calendar**: the dropdown selection determines the parser. Common / Gregorian / Julian accept traditional year numbers with era labels. ISO 8601 is a separate dropdown entry that accepts signed astronomical years. This eliminates ambiguity: the calendar choice IS the parsing convention choice.
- **Islamic variants**: only `islamic-umalqura` in the primary group; `islamic-civil`, `islamic-tbla`, `islamic`, `islamic-rgsa` in the variants group. Revised Julian also in variants.
- **Era labeling per language**: `Intl.DateTimeFormat` produces correct localized AD/BC labels automatically for every language — no authoring needed for the Gregorian calendar. For Common (CE/BCE), CLDR does not expose CE/BCE variants through `Intl.DateTimeFormat` options in most locales, so era labels must be authored in the `ERA_LABELS['ce-bce']` table for all 8 languages. The formatter for Common assembles the string manually using Temporal's `.era` and `.eraYear` fields plus the authored era label. Per-locale word-order templates may be needed (~8 short templates) for fully idiomatic output, since some languages place the era before the year and others after.

## Remaining open decisions

> **Both resolved as of 2026-08-05.** Original text preserved for
> historical reference; see the top-of-file status update for the
> resolutions and the Date-category doc for the full reasoning.

1. **Numeral system control** (RESOLVED: deferred indefinitely; rely on Intl locale-default): currently defaults to the language's canonical numeral system (e.g. `ar` → Arabic-Indic digits). Open question: expose Unicode `-u-nu-` numbering as an independent user-selectable option (letting an Arabic-locale user pick Western `1234` if preferred, or a Persian-locale user pick Western over Persian digits)? Deferred as a possible enhancement.

2. **Handling year-zero or negative-year input in Common** (RESOLVED: reject with helpful inline error, printed in the result-field slot): if a user types "0" or "-212" while Common is the selected calendar, what happens? The Common calendar uses traditional era-labeled numbering (no year zero, positive integers only). Options:
   - **Reject as invalid** with an error like *"For BCE dates use '212 BCE', or select ISO 8601 to enter signed years."* — safest, routes users to the correct calendar.
   - **Interpret literally as astronomical** — matches what the user typed but silently produces off-by-one from what casual users likely intended.
   - **Interpret as traditional BCE** (drop the minus, add BCE) — most forgiving but hides the year-zero distinction and can miscommunicate historical dates.
   
   Recommended: reject as invalid with the helpful error above. Preserves clean per-dropdown semantics.
