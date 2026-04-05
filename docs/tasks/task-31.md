---
title: Smart Paste: compound unit & dimension routing
---
# Smart Paste: Compound Unit & Dimension Routing

  ## What & Why
  Smart Paste currently only routes to a category when the pasted text contains a
  single recognisable symbol (e.g. "5 MeV" → Photon). If the text contains a
  compound unit expression (e.g. "45N·m", "9.8 m/s²", "6'7\"", "127.2342 J⋅s⁻¹")
  `parseUnitText` correctly resolves the SI dimensions but returns `categoryId: null`,
  so Smart Paste silently falls through to the Custom Entry pane without navigating
  anywhere useful.

  The fix: after parsing, if `categoryId` is null but `dimensions` is non-empty,
  walk `CATEGORY_DIMENSIONS` in insertion order, skip excluded/archaic/local
  categories, and route to the first category whose dimensions match. If multiple
  categories match (e.g. energy and torque both share kg·m²·s⁻²), the first one in
  `CATEGORY_DIMENSIONS` order wins. The category's default unit (its `baseUnit`)
  becomes the selected From unit; the parsed value becomes the input value.

  This extends Smart Paste uniformly to ALL non-archaic/non-local unit expressions
  — single or compound, SI or non-SI — without any special-casing.

  ## Done looks like
  - Pasting "45N·m" in Smart Paste navigates to Energy (first match for kg·m²·s⁻²),
    sets value to 45, From unit to Joule.
  - Pasting "9.8 m/s²" navigates to Acceleration, value 9.8, From unit m/s².
  - Pasting "6'7\"" navigates to Length, value converted to metres, From unit Foot & Inch.
  - Pasting "127.2342 J⋅s⁻¹" navigates to Power, value 127.2342, From unit Watt.
  - Pasting a plain "5 MeV" still works as before (symbol route takes priority over
    dimension route).
  - Archaic and local categories (archaic_length, archaic_mass, archaic_volume,
    archaic_area, archaic_energy, archaic_power, typography, cooking, beer_wine_volume,
    shipping, rack_geometry, fuel, fuel_economy, lightbulb, data, math) are never
    selected by dimension routing; those same categories are what `EXCLUDED_CROSS_DOMAIN_CATEGORIES`
    already lists.
  - If no dimension match is found, behaviour is unchanged (falls through gracefully).
  - Custom Entry Smart Paste (handleCustomSmartPasteClick) gets the same treatment.
  - All existing Smart Paste tests continue to pass; new tests cover compound routing.

  ## Out of scope
  - Paste-while-focused interception (Phase 2 idea #3).
  - Any UI or layout changes.

  ## Tasks
  1. **Add `findCategoryByDimensions` helper** — In `client/src/lib/calculator/findCrossDomainMatches.ts`
     or a new file, add a function that accepts a `DimensionalFormula` and returns the
     first matching `categoryId` from `CATEGORY_DIMENSIONS`, skipping
     `EXCLUDED_CROSS_DOMAIN_CATEGORIES`. Dimension equality uses the existing
     `dimensionsEqual` function.

  2. **Extend `handleConverterSmartPaste` in `UnitConverterApp.tsx`** — After
     `parseUnitText`, if `parsed.categoryId` is null and `parsed.dimensions` is
     non-empty (any exponent non-zero), call `findCategoryByDimensions` to resolve a
     category. If resolved: set active category to the match, set From unit to the
     category's `baseUnit` from `CONVERSION_DATA`, set input value from `parsed.originalValue`.
     Return 'ok'. Otherwise fall through unchanged.

  3. **Extend `handleCustomSmartPasteClick` similarly** — Apply the same dimension-based
     routing so that Custom Entry Smart Paste also navigates to the Converter tab when
     a compound expression resolves to a known category.

  4. **Add tests** — In `tests/smart-paste.test.ts`, add cases for: compound N·m
     (Energy), m/s² (Acceleration), J/s (Power), m²·kg·s⁻² with ambiguous match
     (Energy wins over Torque), an archaic-dimension expression that has no non-excluded
     match (graceful fallback). All 1440+ tests must pass.

  ## Relevant files
  - `client/src/features/unit-converter/app/UnitConverterApp.tsx`
  - `client/src/lib/calculator/findCrossDomainMatches.ts`
  - `client/src/lib/units/categoryDimensions.ts`
  - `client/src/lib/units/dimensionalFormula.ts`
  - `client/src/lib/calculator/dimensionsEqual.ts`
  - `client/src/lib/conversion-data.ts`
  - `tests/smart-paste.test.ts`