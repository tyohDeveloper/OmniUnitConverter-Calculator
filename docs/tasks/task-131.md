---
title: Show exact Hijri dates instead of approximate years
---
# Show exact Hijri dates instead of approximate years

  ## What & Why
  The Dates/Eras tab converts Islamic (Hijri) years with a simple lunar-year approximation (±1 year or more across centuries). A proper tabular Islamic calendar algorithm would give exact year mapping for a given Gregorian date, which matters for users converting real historical or religious dates.

  ## Done looks like
  - Hijri conversion uses a tabular/arithmetic Islamic calendar algorithm instead of the linear factor
  - The ±1 note is replaced or narrowed accordingly
  - Tests cover known anchor dates (e.g. 1 Muharram AH 1 = 622 CE)

  ## Relevant files
  - `client/src/lib/eras/hijriApproximation.ts`
  - `client/src/data/eras/eraSchemes.json`
  - `tests/eras.test.ts`