# Compare All Pane Scrollable

## What & Why
The "Compare All" pane currently caps display at 8 units. This hides many units in larger categories (e.g. Archaic Length has 29 units — fathom, chain, furlong are invisible). Making the pane scrollable lets users see all units without the page growing unboundedly.

## Done looks like
- All units in the active category appear in the Compare All pane (not capped at 8)
- The pane has a fixed maximum height and scrolls vertically when the list overflows
- The existing animation (height 0 → auto) still works on open/close
- The special-case light-year pinning logic is removed (no longer needed)

## Out of scope
- Sticky/pinned rows within the scroll list
- Changing the sort order of units
- Any changes to the single-unit conversion panes

## Tasks
1. **Remove the 8-unit cap** — Replace the `slice(0, 8)` limit and the `ly` special-case pin with a simple `allUnits` (all units except the source unit). No cap.
2. **Make the grid scrollable** — Apply a `max-h` (e.g. `max-h-64` or similar) and `overflow-y-auto` to the grid container `div` inside the Compare All pane, so the pane scrolls internally rather than growing the page. Ensure the `motion.div` wrapper's `overflow-hidden` does not interfere during the open animation (move overflow to the inner grid container only).

## Relevant files
- `client/src/features/unit-converter/components/ConverterPane.tsx:457-531`
