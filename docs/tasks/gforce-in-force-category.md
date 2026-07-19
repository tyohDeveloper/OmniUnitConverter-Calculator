# Add g-force to Force category

## What & Why
Add a "g-force" unit to the Force conversion category, defined as the force exerted on 1 kg under standard gravity: 1 g-force = 9.80665 N (same factor as Kilogram-force). This lets users convert g-force directly against newtons, pound-force, kgf, dyne, and kip.

## Done looks like
- The Force category shows a "g-force" unit; entering 1 g-force gives 9.80665 N, and conversions to/from all other force units are correct.
- The unit's name is translated in all 12 languages (translations for "g-force" already exist in the unit localization files from the Acceleration category, so no new translation strings should be needed).
- All existing tests, lint-size, verify-build, and typecheck checks still pass.

## Out of scope
- Gram-force (gf) — not requested.
- Any changes to the existing g-force entry in the Acceleration category.
- New calculator or dimensional-analysis behavior.

## Steps
1. **Add the unit entry** — Add a g-force unit to the Force category data with factor 9.80665, following the existing entry format (choose a symbol that doesn't collide with existing force symbols; note the acceleration category already uses "g-force" as its symbol, which is acceptable since symbols are scoped per category).
2. **Verify localization** — Confirm the existing "g-force" translation key covers the new unit in all 12 languages; add nothing if it already resolves.
3. **Verify checks** — Run the test, lint-size, and verify-build workflows; if the single-file gzip build exceeds its size ceiling (it currently sits ~0.3 kB under), trim or re-baseline per the existing verify-build process.

## Relevant files
- `client/src/data/conversion/force.json`
- `client/src/data/conversion/acceleration.json:34-35`
- `client/src/data/localization/units/en.json:354`
