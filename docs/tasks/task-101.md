---
title: Add gram-force (gf) so small forces convert easily
---
# Add gram-force (gf) to the Force category

  ## What & Why
  The Force category now has g-force and kilogram-force, but not gram-force (gf), a common unit for small forces (springs, RC motors, keyboards). 1 gf = 0.00980665 N.

  ## Done looks like
  - Force category shows "Gram-force" with symbol "gf", factor 0.00980665
  - Conversions to/from N, lbf, kgf, dyne, kip, g-force are correct
  - Unit name translated in all 12 languages (add a "Gram-force" key to unit localization files if missing)
  - Tests, lint-size, verify-build, typecheck pass

  ## Relevant files
  - `client/src/data/conversion/force.json`
  - `client/src/data/localization/units/*.json`