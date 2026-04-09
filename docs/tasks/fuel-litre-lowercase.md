# Lowercase litre symbol in fuel composite units

## What & Why
All composite fuel unit symbols using litre currently show a capital `L` (e.g. `L (diesel)`). The correct SI symbol for litre is lowercase `l`. While capital L is sometimes used to avoid ambiguity with the digit `1` or uppercase `I`, the app uses a sans-serif font where the context of the parenthesised fuel name makes the symbol unambiguous. Lowercase `l` should be used consistently across all composite litre-based fuel units.

## Done looks like
- All litre-based composite fuel symbols display lowercase `l` in the converter UI (e.g. `l (diesel)`, `l (ethanol)`, `l (jet)`, etc.)
- The gasoline unit (`l (petrol)`) changed by Task #56 is consistent with the rest

## Out of scope
- The standalone litre symbol in the volume category (a separate category)
- Any fuel economy units (km/L, L/100km style symbols — separate decision)
- Changing any unit names or conversion factors

## Tasks
1. In `fuel.json`, change the symbol for every litre composite unit from capital `L` to lowercase `l`: `L (ethanol)` → `l (ethanol)`, `L (E-85)` → `l (E-85)`, `L (para)` → `l (para)`, `L (jet)` → `l (jet)`, `L (diesel)` → `l (diesel)`, `L (LNG)` → `l (LNG)`, `L (propane)` → `l (propane)`.

## Relevant files
- `client/src/data/conversion/fuel.json:66-79,94-107,122-135,150-163,206-219,234-247,262-275`
