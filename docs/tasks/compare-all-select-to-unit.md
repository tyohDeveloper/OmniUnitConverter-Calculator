# Compare All: click row to select "to" unit

## What & Why
In the converter's "Compare All" panel, clicking a row currently copies the converted value to the clipboard. Instead, clicking a row should set that row's unit as the active "to" unit and exit comparison mode, so the user lands directly in the standard single-conversion view with their chosen unit.

## Done looks like
- Clicking any row in the Compare All list sets it as the "to" unit in the converter
- Comparison mode closes immediately after the click, revealing the normal conversion view with the new "to" unit active
- The "to" prefix is reset to "none" when a unit is selected this way (since the compare list doesn't show prefix choices)
- The clipboard copy on row click is removed

## Out of scope
- Keeping the old copy-to-clipboard behaviour on row click
- Adding a separate "copy" affordance within each compare row

## Tasks
1. **Update Compare All row click handler** — In `ConverterPane`, replace the `onClick` of each comparison row so it calls `setToUnit(unit.id)`, resets the "to" prefix to `'none'`, and calls `setComparisonMode(false)` instead of writing to the clipboard.

## Relevant files
- `client/src/features/unit-converter/components/ConverterPane.tsx:528-544`
