---
title: Add logarithmic units (dB, Bel, Neper, pH, EV, decade, info entropy)
---
# Add logarithmic units (dB, Bel, Neper, pH, EV, decade, information entropy)

## What & Why
Task #84 (Unitless Numbers, now merged) intentionally skipped logarithmic units because JSON units could only express plain multiplicative factors. The conversion function registry introduced for paper sizes removes that blocker: category JSON may now reference a named code-side function pair via `conversionFunction`, with validation and safe exclusion of non-linear units from factor-assuming features. Add decibel (dB), bel (B), neper (Np), pH, photographic stops (EV), and decades using this infrastructure, plus information-entropy log units (shannon/bit, nat, hartley/ban, deciban, dit) placed in the existing data/information category.

## Done looks like
- A logarithmic-scale grouping is available under Other (either extending the unitless category or a dedicated "Logarithmic Scales" category — pick whichever avoids symbol collisions and reads best in the UI).
- dB, B, Np, EV (stops, log₂), and decade (log₁₀) convert among themselves — these are all mutually linear log-scale units (1 B = 10 dB, 1 Np ≈ 8.685889638 dB, 1 decade = 10 dB power-sense = log₂10 ≈ 3.3219 stops) — and, via registry function pairs, to/from the underlying dimensionless ratio if a ratio unit is offered. Pick and document one consistent convention (power-ratio sense) so the linear relations are unambiguous.
- pH converts to/from hydrogen-ion molar concentration (or an equivalent ratio representation) via a non-linear registry pair. pOH is explicitly excluded.
- Information-entropy units — shannon (Sh, = 1 bit of information), nat, hartley (Hart, = ban = dit), and deciban — are added to the existing data/information category as linear factor units among themselves (1 Hart = log₂10 Sh ≈ 3.3219 Sh, 1 nat = log₂e Sh ≈ 1.4427 Sh, 1 deciban = 0.1 Hart), taking care not to conflict with the existing storage bit/byte units and their binary prefixes; if mixing information-entropy with storage bits is confusing, use a distinct subgroup or naming.
- Non-linear pairs are registered WITHOUT `linear: true` so `isNonLinearUnit()` excludes them from smart paste, comparison mode, and calculator lookup — same treatment as math-function units.
- For any linear pairs, the JSON `factor` exactly equals `pair.toBase(1)` (the existing sync test must pass).
- Localized unit names for the 12 supported languages; symbols (dB, B, Np, pH, EV, Sh, nat, Hart) stay untranslated.
- Unit tests cover the log conversions, round-trips, exact linear relations, and exclusion from factor-based consumers.
- `verify-build` still passes — the single-file build is right at the size ceiling, so this depends on Task #99 landing first; keep added data minimal.

## Out of scope
- pOH.
- Reference-level absolute units (dBm, dBW, dBSPL, dBV) — these need a reference-quantity concept, not just a log scale.
- Richter/moment magnitude, stellar magnitude, phon/sone loudness scales.
- Octaves and cents (may come later as a music-interval feature).

## Steps
1. **Register conversion function pairs** — Add named log/exp pairs to the conversion function registry for log-scale-to-ratio (dB/B/Np/EV/decade) and pH-to-concentration, marking non-linear pairs appropriately (no `linear: true`).

2. **Logarithmic category data + localization** — Add dB, B, Np, EV, decade, and pH to the unitless category JSON (or a new category file registered like the other 70), referencing registry entries by name, with unit-name translations for the 12 languages.

3. **Information-entropy units in data category** — Add shannon, nat, hartley/ban, deciban, and dit to the existing data/information category as linear units, with translations, ensuring no symbol or naming collision with storage bits/bytes.

4. **Tests** — Vitest coverage for conversions, exact linear relations among the log-scale units, factor/registry sync for linear pairs, and verification that non-linear units are excluded from smart paste, comparison, and calculator lookup.

## Relevant files
- `client/src/lib/units/conversionFunctionRegistry.ts`
- `client/src/data/conversion/unitless.json`
- `client/src/lib/conversion-data.ts`