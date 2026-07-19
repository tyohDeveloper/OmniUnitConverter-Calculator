# Add logarithmic dimensionless units (dB, Bel, Neper, pH)

## What & Why
Task #84 (Unitless Numbers, now merged) intentionally skipped logarithmic units because JSON units could only express plain multiplicative factors. The conversion function registry introduced for paper sizes removes that blocker: category JSON may now reference a named code-side function pair via `conversionFunction`, with validation and safe exclusion of non-linear units from factor-assuming features. Add decibel (dB), bel (B), neper (Np), and pH using this infrastructure.

## Done looks like
- A logarithmic-scale grouping is available under Other (either extending the unitless category or a dedicated "Logarithmic Scales" category — pick whichever avoids symbol collisions and reads best in the UI).
- dB, B, and Np convert among themselves (these are mutually linear: 1 B = 10 dB, 1 Np ≈ 8.685889638 dB) and, via registry function pairs, to/from the underlying power ratio (dimensionless) if a ratio unit is offered.
- pH converts to/from hydrogen-ion molar concentration (or an equivalent ratio representation) via a non-linear registry pair.
- Non-linear pairs are registered WITHOUT `linear: true` so `isNonLinearUnit()` excludes them from smart paste, comparison mode, and calculator lookup — same treatment as math-function units.
- For any linear pairs, the JSON `factor` exactly equals `pair.toBase(1)` (the existing sync test must pass).
- Localized unit names for the 12 supported languages; symbols (dB, B, Np, pH) stay untranslated.
- Unit tests cover the log conversions, round-trips, and exclusion from factor-based consumers.
- `verify-build` still passes — the single-file build is ~0.3 kB gzip under the size ceiling, so this depends on Task #99 landing first; keep added data minimal.

## Out of scope
- Reference-level absolute units (dBm, dBW, dBSPL, dBV) — these need a reference-quantity concept, not just a log scale.
- Richter/moment magnitude, stellar magnitude, phon/sone loudness scales.

## Steps
1. **Register conversion function pairs** — Add named log/exp pairs to the conversion function registry for dB/B/Np-to-ratio and pH-to-concentration, marking non-linear pairs appropriately (no `linear: true`).

2. **Category data + localization** — Add the logarithmic units to the unitless category JSON (or a new category file registered like the other 70), referencing the registry entries by name, and add unit-name translations for the 12 languages.

3. **Tests** — Vitest coverage for conversions, exact linear relations among dB/B/Np, factor/registry sync for linear pairs, and verification that non-linear units are excluded from smart paste, comparison, and calculator lookup.

## Relevant files
- `client/src/lib/units/conversionFunctionRegistry.ts`
- `client/src/data/conversion/unitless.json`
- `client/src/lib/conversion-data.ts`
