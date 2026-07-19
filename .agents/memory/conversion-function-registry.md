---
name: Conversion function registry
description: How non-factor unit conversions work; invariants to keep when adding function-based units.
---
Units may declare `conversionFunction: "<name>"` in category JSON, resolved against the code-side registry in `client/src/lib/units/conversionFunctionRegistry.ts`. Zod validation at load rejects unknown names and one-way pairs referenced this way (one-way entries back the calculator's math functions only).

**Rules when adding function-based units:**
- Keep the unit's JSON `factor` exactly equal to `pair.toBase(1)` for linear pairs — factor-based consumers (smart paste, comparison, calculator lookup) use the factor directly; a test enforces this.
- Mark truly non-linear pairs without `linear: true` so `isNonLinearUnit()` excludes them from those consumers (same treatment as math-function units).
- Paper sizes use sheet-count semantics: series anchored at size 0's mm area, halved by exact `2 ** n`, so within-series ratios are exact powers of two; cross-series goes through mm-derived anchor areas.

**Why:** Silent wrong results occur if a non-linear unit leaks into factor-assuming consumers, or if JSON factor drifts from the registered function.

**Unit ordering:** Category JSON unit arrays must be SI base (factor 1) first, then ascending factor — a test computes the expected order independently. A short list of special-ordered categories (archaic_*, fuel_economy, temperature, paper_sizes, etc.) is exempt; when adding units elsewhere, insert in sorted position, not appended.
