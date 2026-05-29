---
title: Let people type counting words like 'dozen' or '%' to convert instantly
---
# Enable smart-paste / symbol parsing for Unitless Numbers

  ## What & Why
  The new "Unitless Numbers" category (client/src/data/conversion/unitless.json) shares several symbols (ppt, ppb, ppm, %, ‰) with the existing concentration category. Because the global symbol map (buildUnitSymbolMap in client/src/lib/conversion-data.ts) is first-wins by CONVERSION_DATA order, smart-paste / symbol parsing currently resolves those ambiguous symbols to the concentration category, never to unitless. Counting words like "doz", "score", "gross", "myriad" parse fine, but the overlapping ratio symbols do not reach unitless.

  ## Done looks like
  - Decide and implement a disambiguation strategy (e.g. category-aware parsing, or distinct symbols) so users can paste/type "5 %", "12 doz", "1 ppm" and land in the intended category.
  - Add tests in tests/smart-paste.test.ts and tests/symbol-parsing.test.ts covering the unitless cases.

  ## Relevant files
  - client/src/lib/conversion-data.ts (buildUnitSymbolMap, parseUnitText)
  - client/src/data/conversion/unitless.json
  - client/src/data/conversion/concentration.json