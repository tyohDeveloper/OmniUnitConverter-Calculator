# Quantity Row Spacing & Click Affordance

## What & Why
The calculator quantity rows are too tightly packed (8px gap, 40px height) and have only a faint hover background change to indicate they're clickable. Users struggle to tap the right row and don't realise the rows are interactive. Increasing the vertical spacing and making the hover/active states more prominent will fix both problems.

## Done looks like
- There is noticeably more vertical space between each quantity row, making it easier to tap or click the intended row without accidentally hitting an adjacent one.
- Hovering over a clickable row produces a clearly visible visual change (e.g. stronger background shift, a visible border highlight, or a subtle shadow) — it is unmistakable that the row is interactive.
- Empty (non-clickable) rows remain visually distinct and do not show the interactive treatment.
- The overall layout still fits comfortably within the panel without requiring scrolling.

## Out of scope
- Changing the width or font size of the quantity display.
- Altering click behaviour or copy-to-clipboard logic.
- Changes to the converter pane result rows (only the calculator stack rows are in scope).

## Tasks
1. **Increase row spacing** — Change the `space-y-2` gap between quantity rows to a larger value (e.g. `space-y-3` or `space-y-4`) so rows are easier to target individually.
2. **Strengthen hover/active styling** — Replace the subtle `hover:bg-muted/50` with a more visible treatment on clickable rows (e.g. stronger background, a coloured left border accent, or a box-shadow ring) so users can clearly see the row is interactive before clicking.

## Relevant files
- `client/src/components/unit-converter/components/CalculatorFieldDisplay.tsx`
- `client/src/features/unit-converter/components/CalculatorPane.tsx`
- `client/src/components/unit-converter/constants.ts`
