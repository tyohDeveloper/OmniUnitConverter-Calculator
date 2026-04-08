# Archaic Unit Naming Convention Pass

## What & Why
Unit names in the archaic mass, volume, and length data are inconsistent and sometimes misleading. Some carry a "(US)" locale tag when the unit is actually identical in Imperial, some are missing the system name (e.g. "Dram (US)" doesn't tell you it's avoirdupois), and one unit (Dram — Apothecaries') is missing entirely. The goal is a single coherent naming convention:
- Units identical across US and Imperial → no locale qualifier (e.g. "Furlong", "Grain")
- Units specific to one measurement system → system name + locale where helpful (e.g. "Dram (Avoirdupois, US)", so users who don't recognise "Avoirdupois" still see "US")
- Apothecaries' and Troy units → system name only, no locale (same value in US and UK)

## Done looks like
- "Grain" appears without any system/locale qualifier.
- "Dram (Avoirdupois, US)" and "Dram (Apothecaries')" both appear as distinct archaic mass entries.
- "Scruple (Apothecaries')" uses the full, correctly-spelled system name.
- "Troy Ounce" and "Troy Pound" have no "(US)" qualifier.
- "Fluid Ounce (Apothecaries')" replaces the misleading "Apothecary Ounce (US)".
- "Fluid Scruple (Apothecaries')" replaces "Fluid Scruple (Imperial)".
- "Hand", "Fathom", "Rod/Pole/Perch", "Furlong", "League" have no "(US)" qualifier.

## Out of scope
- Unit factors / conversion values (no numeric changes except adding the new Dram entry).
- Units in shipping.json, rack_geometry.json, or any non-archaic data file (they already use unlabelled names).
- Any UI layout or grouping changes.

## Tasks
1. **Archaic mass renames** — Apply the naming convention to archaic_mass.json: rename Grain, Dram, Scruple, Troy Ounce, Troy Pound as specified above. Add the missing "Dram (Apothecaries')" entry (`id: "dram_ap"`, symbol `"dr ap"`, factor `0.0038879346` kg, `unitType: "IMPERIAL"`).
2. **Archaic volume renames** — Rename "Apothecary Ounce (US)" → "Fluid Ounce (Apothecaries')" and "Fluid Scruple (Imperial)" → "Fluid Scruple (Apothecaries')" in archaic_volume.json.
3. **Archaic length renames** — Remove the "(US)" qualifier from Hand, Fathom, Rod/Pole/Perch, Furlong, and League in archaic_length.json.

## Relevant files
- `client/src/data/conversion/archaic_mass.json:162-210`
- `client/src/data/conversion/archaic_volume.json:107-112,127-133,183-189`
- `client/src/data/conversion/archaic_length.json:183-231`
