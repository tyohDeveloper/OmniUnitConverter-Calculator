# Add Long Time Units

## What & Why
Add four large time units — **Eon**, **Millennium**, **Century**, and **Decade** — to the **Time** category. Century and Decade are also being added to the new "Unitless Numbers" category (Task #84) as pure counts (100 and 10); since they're more naturally time spans, remove them from the Unitless Numbers category so each lives in exactly one place.

## Done looks like
- The Time category lists Eon, Millennium, Century, and Decade alongside the existing units (Second … Year), correctly ordered by magnitude.
- Conversions are correct relative to the existing Year (1 yr = 31540000 s):
  - Decade = 10 × year
  - Century = 100 × year
  - Millennium = 1000 × year
  - Eon = 1,000,000,000 (1e9) years
- The four new units are fully translated in all 12 languages.
- Decade and Century no longer appear in the Unitless Numbers category.
- Build, typecheck, lint-size, and tests all pass.

## Out of scope
- Any change to other Time units or factors.
- Any change to other Unitless Numbers entries.

## New Time units (factors in seconds, based on existing year = 31540000 s)
| Name | Symbol | Factor (s) | Notes |
|---|---|---|---|
| Decade | `dec` | 315400000 | 10 × year |
| Century | `c` | 3154000000 | 100 × year |
| Millennium | `kyr` | 31540000000 | 1000 × year |
| Eon | `eon` | 3.154e16 | 1e9 × year |

Match the existing Time unit object shape in `client/src/data/conversion/time.json` (e.g. `unitType: "SI_BASE"`, `measurementSystem: "SI"`, no `allowPrefixes` unless appropriate). Insert them after Year, ordered ascending by factor. Verify the chosen symbols don't collide with existing global unit symbols (the app's symbol map / smart paste); if any clash, pick a sensible distinct symbol and note the change.

## Steps
1. **Add the four Time units** — Add Decade, Century, Millennium, and Eon to `client/src/data/conversion/time.json` with the factors above, ordered by magnitude, matching the existing object structure.

2. **Remove Decade & Century from Unitless Numbers** — Remove the `Decade` (factor 10) and `Century` (factor 100) entries from the Unitless Numbers category data (`client/src/data/conversion/unitless.json`, created by Task #84).

3. **Localization (all 12 languages)** — Add the four new time unit names to every file in `client/src/data/localization/units/` (`ar, de, en-us, en, es, fr, it, ja, ko, pt, ru, zh`), translating where appropriate and keeping symbols unchanged. Remove the now-unused Decade/Century unit-name keys only if they are no longer referenced by any remaining unit (Decade/Century may still be referenced elsewhere — keep keys that are still used).

4. **Verify symbol uniqueness** — Confirm the new Time symbols don't clash with higher-priority existing units in the global symbol map; adjust and document any change.

5. **Tests** — Add/extend unit tests covering the new Time conversions (decade, century, millennium, eon) and confirm Decade/Century are no longer present in the Unitless Numbers category. Ensure localization-coverage tests pass for all 12 languages.

6. **Validate** — Run typecheck, lint-size, tests, and verify-build; fix any failures.

## Relevant files
- `client/src/data/conversion/time.json`
- `client/src/data/conversion/unitless.json`
- `client/src/lib/conversion-data.ts`
- `client/src/data/localization/units/`
