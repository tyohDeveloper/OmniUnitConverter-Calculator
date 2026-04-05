# Fix Foot-Inch Unit Name & Symbol

## What & Why
The foot-inch unit currently shows as "Foot:Inch" with symbol "ft:in" in the unit selector. The standard notation for this unit uses apostrophe and quote marks (like 6'7"), so the name and symbol should reflect that convention.

## Done looks like
- The unit selector shows the foot-inch option using the proper notation (e.g., `ft'in"`) instead of the colon-separated form
- The result display continues to format correctly as `6'7"` (unchanged — this already works)
- Input parsing continues to work as before

## Out of scope
- Any changes to the formatting or parsing logic (already correct)
- Other units or categories

## Tasks
1. Update the `ft_in` unit entry in the length data file — change the `name` from `"Foot:Inch"` to something like `"Foot & Inch"` and the `symbol` from `"ft:in"` to `"ft'in\""` so it reflects standard notation in the UI.
2. Check if the colon-separated symbol `ft:in` or name `Foot:Inch` appears anywhere else in the codebase (other JSON files, display logic, or hardcoded strings) and update those occurrences to match.

## Relevant files
- `client/src/data/conversion/length.json:34-38`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
- `client/src/features/unit-converter/components/ConverterPane.tsx`
