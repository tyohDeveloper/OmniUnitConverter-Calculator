# Reduce Gap Between Sidebar and Main Panels

## What & Why
The main content panels (Converter, Direct, Calculator) sit further right than necessary, leaving noticeable empty space next to the category/qualities sidebar. Closing that gap slightly brings the panels closer to the sidebar without crowding it.

## Done looks like
- The main panels are visibly closer to the sidebar — a few `em` less separation than before.
- The sidebar and panels still feel clearly distinct with comfortable breathing room between them.
- No content is clipped or overlapping on desktop or narrow viewports.

## Out of scope
- Changing the sidebar width (260px)
- Altering internal panel padding (`p-6` / `p-8` inside the cards)
- Any mobile layout changes

## Tasks
1. **Reduce the grid gap** — Lower the `gap-8` (32px) on the main two-column grid in `UnitConverterApp` to a tighter value (e.g. `gap-4` or `gap-5`), keeping enough space that the sidebar and main content don't feel crowded. Also check whether the outer horizontal padding (`px-8`) can be trimmed slightly on the left side to reinforce the shift.

## Relevant files
- `client/src/features/unit-converter/app/UnitConverterApp.tsx:221`
