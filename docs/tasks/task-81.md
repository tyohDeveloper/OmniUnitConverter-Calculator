---
title: Narrow stack column & fix precision label spacing
---
# Narrow Stack Column & Fix Precision Spacing

## What & Why
The stack column (and the buttons aligned with it) is currently 285px wide, which is wider than necessary. Reducing it will give more visual room to the number display area. At the same time, the precision label and the RPN/Simple toggle button sit in the same header row and can cramp against each other — the layout needs enough spacing between them to stay comfortable at all sizes.

## Done looks like
- The stack column and its aligned buttons are visibly narrower than before, with plenty of room for numbers still displayed cleanly.
- The precision label and the mode toggle (CALCULATOR ⇅ / CALCULATOR - RPN ⇅) never touch or overlap; there is clear breathing room between them across both Simple and RPN modes.
- No horizontal scrolling or clipping is introduced.

## Out of scope
- Changing the number of buttons or their functionality.
- Resizing anything outside the calculator panel (sidebar, comparison panel, etc.).

## Tasks
1. **Reduce the stack column width constant** — Lower `CommonFieldWidth` in the constants file to a tighter value that still fits long numbers comfortably, and verify all grid templates using it (Simple and RPN rows) still align correctly.
2. **Add spacing between precision label and mode toggle** — Adjust the header row layout in `CalculatorPane.tsx` so there is always a clear gap between the precision control group and the RPN/Simple toggle label, preventing them from cramping together.

## Relevant files
- `client/src/components/unit-converter/constants.ts`
- `client/src/features/unit-converter/components/CalculatorPane.tsx`