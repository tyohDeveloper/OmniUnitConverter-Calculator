---
title: Add missing common & archaic units
---
# Add Missing Common & Archaic Units

## What & Why
An audit across all 70 conversion categories found common everyday units that are absent, plus gaps in the archaic categories. Adding them improves real-world coverage (weather, medicine, automotive, historical use).

## Done looks like
- Fuel Economy includes L/100 km (reciprocal conversion via the existing conversion function registry)
- Speed includes foot per second (ft/s)
- Pressure includes inch of mercury (inHg), inch of water (inH₂O), and technical atmosphere (at, kgf/cm²)
- Mass includes the dalton / unified atomic mass unit (Da / u)
- Plane Angle includes turn (revolution) and NATO mil
- Force includes poundal (pdl), ounce-force (ozf), and ton-force (short/metric as sensible)
- Electric Charge includes elementary charge (e), statcoulomb (statC), and abcoulomb (abC)
- Resistance includes statohm and abohm
- Magnetic Flux Density includes gamma (γ)
- Density includes kg/L, lb/gal (US), and slug/ft³
- Concentration includes g/L and mg/dL
- Length includes mil/thou
- Volume includes board foot (FBM)
- Time includes fortnight
- Temperature includes Réaumur (°Ré)
- Area includes are (symbol "are") and rood
- Archaic Length adds: verst, sazhen, toise, Roman mile (mille passus), barleycorn
- Archaic Mass adds: pood, zolotnik, shekel, mina, talent, quintal
- Archaic Volume adds: tun, butt (pipe), kilderkin, pottle, chaldron, sextarius, congius
- Archaic Area adds: rood is in Area (do not duplicate); add arpent, rai (Thai), hide
- All new units have localized names in the 12 language files and pass existing tests; build stays under the gzip size ceiling

## Collision safeguards (verified July 2026)
- No planned unit IDs collide with existing IDs across all 70 data files.
- Duplicate symbols across categories are tolerated (first-registered-wins symbol map with priority overrides in the Smart Paste lookup); all planned symbols are unique within their target category.
- Handle these three ambiguities explicitly:
  1. Change Euler's constant symbol in Unitless to "𝑒" (U+1D452 mathematical italic small e), freeing plain "e" for elementary charge in Electric Charge. Add Smart Paste tests confirming "e" resolves to elementary charge and "𝑒" to Euler's constant.
  2. Use symbol "are" (not "a") for the are unit in Area, avoiding the atto- prefix clash. "at" (technical atmosphere) could still parse as atto+tonne — add a Smart Paste test for "2 at" and disambiguate if it misroutes.
  3. NATO mil (angle) vs mil/thou (length) are both in this batch: use symbol "mil (NATO)" for angle and "thou" for length to avoid a same-batch symbol clash.

## Out of scope
- New quantity categories (a Luminance category with nit/lambert/foot-lambert was noted as a gap — separate decision)
- Roentgen (radiation exposure is a different quantity than the existing dose categories)
- UI or engine changes beyond what new unit entries require

## Steps
1. **Common-unit additions** — Add the missing common units listed above to their category JSON files with correct factors; Réaumur and L/100 km are non-linear/reciprocal and must use the named conversion function registry (keep factor field in sync where applicable).
2. **Archaic additions** — Add the Russian, French, Roman, biblical, and regional archaic units to the four archaic category files with sourced conversion factors.
3. **Localization** — Add translated unit names for every new unit across all 12 language files, preserving standard symbols.
4. **Tests & verification** — Extend conversion tests with spot checks for the new units (especially L/100 km and Réaumur round-trips), run the full test suite, and verify the single-file build gzip size stays under the ceiling (~92 kB headroom as of July 2026).

## Relevant files
- `client/src/data/conversion/fuel_economy.json`
- `client/src/data/conversion/speed.json`
- `client/src/data/conversion/pressure.json`
- `client/src/data/conversion/mass.json`
- `client/src/data/conversion/angle.json`
- `client/src/data/conversion/force.json`
- `client/src/data/conversion/charge.json`
- `client/src/data/conversion/resistance.json`
- `client/src/data/conversion/magnetic_density.json`
- `client/src/data/conversion/density.json`
- `client/src/data/conversion/concentration.json`
- `client/src/data/conversion/length.json`
- `client/src/data/conversion/volume.json`
- `client/src/data/conversion/time.json`
- `client/src/data/conversion/temperature.json`
- `client/src/data/conversion/area.json`
- `client/src/data/conversion/archaic_length.json`
- `client/src/data/conversion/archaic_mass.json`
- `client/src/data/conversion/archaic_volume.json`
- `client/src/data/conversion/archaic_area.json`