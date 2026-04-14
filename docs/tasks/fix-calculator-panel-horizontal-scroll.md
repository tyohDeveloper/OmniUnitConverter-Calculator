# Fix Calculator Panel Horizontal Scroll Clipping

## What & Why
When the calculator (and converter) content overflows horizontally — due to fixed-width grid columns for the keypad/buttons — the grey card background doesn't stretch to cover the overflowing content. The result is the card background visually "ends" mid-screen while the Smart Paste and Copy buttons appear to float outside the panel. The fix is to ensure the card background always wraps the full width of its content.

## Done looks like
- Scrolling the calculator/converter horizontally keeps the grey panel background behind all content, including the Smart Paste and Copy buttons — nothing appears to float outside the card.
- On narrow screens the horizontal scroll (if it occurs) scrolls the full panel as a unit, not just the inner content.
- No visual regression on desktop or wide viewports.

## Out of scope
- Changing the fixed-width grid layout of the calculator buttons
- Removing horizontal scrollability (phone landscape use is fine)
- Responsive redesign of the calculator keypad

## Tasks
1. **Contain overflow inside the card** — Apply `overflow-x-auto` (or equivalent) at the card/panel level for the CalculatorPane (and ConverterPane if similarly affected), so horizontal scrolling happens within the card boundary rather than at the page level. Use `min-w-max` or `w-max` on the inner content wrapper as needed so the card background stretches to cover all content. Ensure the outer page container does not introduce a second scroll layer.

2. **Verify Smart Paste / Copy button containment** — Confirm that the action buttons row (Smart Paste, Copy) is inside the same scrollable container as the keypad, so they stay within the card background at all scroll positions.

## Relevant files
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
- `client/src/features/unit-converter/components/CalculatorPane.tsx`
- `client/src/pages/home.tsx`
