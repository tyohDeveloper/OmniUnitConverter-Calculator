# Fix Custom Entry Label Alignment

## What & Why
The physical quantity label in the Custom Entry tab currently sits below the Result field, disrupting the alignment between the Value input and Result field. It should instead appear below the Dimensions block, which is a more natural location and avoids any layout shifting.

## Done looks like
- The Value input and Result field remain vertically aligned at all times — no layout shift when a quantity is matched.
- Matched physical quantity names appear below the Dimensions grid, one name per line, in the existing accent color style.
- If no quantity matches, nothing is shown in that area.

## Out of scope
- Changes to the label content, matching logic, or styling beyond placement.

## Tasks
1. **Relocate the quantity label** — Remove the label from under the Result field and render it below the Dimensions block (after the last row of dimension buttons, before the Copy button). Render one `<span>` per matched quantity rather than joining them into a single line.

## Relevant files
- `client/src/features/unit-converter/components/DirectPane.tsx:140-294`
