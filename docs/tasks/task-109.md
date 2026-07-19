---
title: Add Luminance category
---
# Add Luminance Category

## What & Why
Add a Luminance conversion category (photometric brightness of a surface, base unit candela per square metre). The `luminance` category ID is already registered in the type union and dimension map (`intensity: 1, length: -2`), but no data file exists, so the category never appears in the app. This completes the photometry family alongside Illuminance, Luminous Flux, and Luminous Intensity.

## Done looks like
- A "Luminance" category appears in the UI grouped with the other light/photometry categories
- Units convert correctly, including at minimum:
  - candela per square metre (cd/m², base, factor 1, SI-prefixable)
  - nit (nt, = 1 cd/m²)
  - stilb (sb, = 10,000 cd/m²)
  - lambert (L, = 10,000/π cd/m²)
  - foot-lambert (fL, = 1/π cd/ft² ≈ 3.426259 cd/m²)
  - apostilb / blondel (asb, = 1/π cd/m²)
  - skot (sk, = 10⁻³ asb) and bril (= 10⁻⁷ asb)
  - candela per square foot and candela per square inch
- Category name and unit names localized in all 12 languages
- Cross-domain dimensional analysis recognizes luminance results (dimensions already mapped)
- All existing tests plus JSON integrity checks pass; build stays under the gzip size ceiling (verify-build)

## Out of scope
- Radiometric radiance (W/(sr·m²)) — different quantity
- Changes to Illuminance, Luminous Flux, or Intensity categories

## Steps
1. **Category data** — Create the luminance JSON data file with the units above (all simple linear factors; use high-precision values for π-based units), and register it in the conversion data array.
2. **UI grouping** — Add the category to the appropriate light/photometry group so it shows in the sidebar/dropdown near Illuminance.
3. **Localization** — Add the category name and unit name translations for all 12 languages in the UI and unit localization files.
4. **Tests** — Add unit tests covering conversions (e.g., stilb ↔ cd/m², foot-lambert ↔ nit round-trips) and confirm JSON integrity, typecheck, lint-size, and verify-build all pass.

## Relevant files
- `client/src/lib/conversion-data.ts`
- `client/src/lib/units/unitCategory.ts`
- `client/src/data/conversion/illuminance.json`
- `client/src/data/conversion/luminous_flux.json`