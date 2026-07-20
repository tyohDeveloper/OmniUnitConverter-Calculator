---
title: Sources reference page cleanup
---
# Sources Reference Page Cleanup

## What & Why
The Sources reference page renders one small table per category, so the third (link) column doesn't line up across categories, and the formula column has several formatting inconsistencies (× vs ⋅, caret exponents, redundant "1"s, generic x/y variables). Clean up alignment and formula presentation for a consistent, readable reference.

## Done looks like
- All source links (3rd column) align vertically down the whole page: the page is rendered as a single table (or CSS grid with shared column tracks), with category names as full-width header rows and spacer rows where needed.
- Numeric multiplication uses "⋅" everywhere (e.g. "1.602⋅10⁻¹⁹"); "×" is removed from numeric contexts, including scientific notation output.
- Exponents render as Unicode superscripts where possible: "10^3" → "10³", "10^−19" → "10⁻¹⁹", including negative and multi-digit exponents. Where an exponent contains a fraction (e.g. x/10), keep a readable parenthesized form such as "10^(x/10)" only if superscript rendering is impractical — prefer superscript characters (ˣ, parentheses, digits, ⁄) when they render cleanly.
- The redundant leading "1" in the equivalence column is dropped: "1 ft = 0.3048 m" → "ft = 0.3048 m". Offset/inverse forms are adjusted consistently.
- Unitless Numbers category: the trailing base symbol "1" is dropped (e.g. "ppm = 10⁻⁶" instead of "ppm = 0.000001 1"), and factors use superscript scientific notation.
- Inverse units (radioactive decay half-life/mean-life, wavelength) no longer show generic "y … = k / x …"; they show a relation using the actual unit symbols, e.g. "t½(s) = 0.693147…/x" with a clear meaning, replacing the confusing floating "y".
- Decibel-style units read more cleanly, e.g. "P = µW⋅10^(x/10)" (superscripted where possible) — note the exponent stays x/10; the leading "1 " before the reference unit is dropped. Formulas remain mathematically correct.
- Paper Sizes show dimensions as length × width (e.g. "A4 = 210 mm × 297 mm") — this is the only place "×" remains, since it denotes physical dimensions, not multiplication.
- SI derived units show their base-SI decomposition on the right-hand side, e.g. "J = kg⋅m²⋅s⁻²", "W = kg⋅m²⋅s⁻³", "Pa = kg⋅m⁻¹⋅s⁻²", "N = kg⋅m⋅s⁻²", "V = kg⋅m²⋅s⁻³⋅A⁻¹", etc., for the base unit rows of derived-unit categories.
- Existing Vitest tests for the formatting helpers updated/added; lint-size, typecheck, tests, and verify-build all pass.

## Out of scope
- Changing any conversion factors or unit data values (formatting only; formulas must remain mathematically equivalent).
- Redesigning other parts of the help/reference UI.
- Adding new sources or units.

## Steps
1. **Single-table layout** — Restructure the Sources section into one table (or grid) spanning all categories so column 3 links align page-wide; category names become full-width divider rows.
2. **Formatter overhaul** — Update the SI-equivalent and factor formatters: drop the leading "1", use "⋅" for numeric multiplication, convert exponents to Unicode superscripts (including scientific notation), handle the unitless category's bare-number display.
3. **Defining relations cleanup** — Rewrite the defining-relations strings (decibel family, log scales, pH, fuel economy) in the cleaned style with superscripts and "⋅", keeping exponents mathematically correct (x/10, x/20 etc.).
4. **Inverse-unit relations** — Replace the generic "y = k / x" rendering for inverse units (radioactive decay, wavelength) with relations using the actual unit symbols.
5. **Paper sizes as dimensions** — Render paper size rows as length × width dimensions instead of an area factor, keeping "×" only here.
6. **SI derived base decomposition** — Add base-SI decompositions (kg⋅m²⋅s⁻² style) for derived-unit category base rows and render them on the right-hand side.
7. **Tests & checks** — Update unit tests for the changed formatters, add coverage for superscript conversion and paper-size rendering, and run lint-size, typecheck, tests, and verify-build.

## Relevant files
- `client/src/components/sources-section.tsx`
- `client/src/lib/units/formatSiEquivalent.ts`
- `client/src/lib/units/formatSiFactor.ts`
- `client/src/lib/units/definingRelations.ts`
- `client/src/data/conversion/paper_sizes.json`
- `client/src/data/conversion/unitless.json`
- `client/src/data/conversion/radioactive_decay.json`