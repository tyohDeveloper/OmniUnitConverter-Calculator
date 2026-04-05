---
title: Re-express input on unit change (converter + X register)
---
# Re-express Input on Unit Change

## What & Why
In both the converter and the calculator X register entry field, when the user changes
the selected unit or prefix, the typed number stays the same but now refers to a
different physical quantity. The number should be re-expressed in the newly selected
unit so the physical quantity is preserved.

Examples:
- Converter: input "1", From = meters → change to centimeters → input becomes "100".
  The "To" result stays unchanged (still 3.28084 ft).
- Converter: input "12", From = inches → change to feet → input becomes "1".
- X register: typed "100", unit = cm → change to m → field shows "1". The SI value
  stored on push remains the same.
- X register: typed "24", unit = inches → change to feet → field shows "2".

The re-expression works for any unit pair — SI to SI, SI to non-SI, and non-SI to
non-SI. The algorithm always goes through SI internally (old unit → SI value → new
unit), so there is no special-casing needed for non-SI units.

## Done looks like
- **Converter:** Changing the "From" unit or prefix re-expresses the input number in
  the new unit while keeping the physical quantity (and the "To" result) unchanged.
  This includes non-SI to non-SI changes (e.g., inches → feet).
- **Calculator X register:** Changing the unit or prefix in the X register entry area
  re-expresses the currently typed number in the new unit (same SI quantity).
  This includes non-SI to non-SI changes.
- Temperature units are handled correctly using offset-aware conversion (not just
  factor multiplication).
- DMS and ft-in special input formats are excluded from re-expression — the input is
  left untouched since numeric re-expression doesn't apply cleanly to those formats.
- If the input is empty or non-numeric, no re-expression is attempted.
- Changing the "To" unit in the converter does NOT re-express the input (it only
  affects the result display).

## Out of scope
- Changing copy/paste behavior between the converter and the X register.
- Any changes to how stack values are stored (already SI internally).
- Re-expressing values already on the RPN stack (only the live entry field is affected).

## Tasks
1. **Converter: re-express on From unit/prefix change** — In `UnitConverterApp.tsx`,
   track the previous `fromUnit` and `fromPrefix` using refs. When either changes,
   compute the SI value from the old unit+prefix, re-express it in the new unit+prefix,
   and update `inputValue`. Handle temperature (offset-aware) and skip DMS / ft-in.

2. **Calculator X register: re-express on unit/prefix change** — When the unit or
   prefix dropdown for the X register entry field changes, apply the same re-expression
   logic to the typed value in the X register input, keeping the SI equivalent constant.

## Relevant files
- `client/src/features/unit-converter/app/UnitConverterApp.tsx:63-90,283-290,460-479`
- `client/src/features/unit-converter/components/CalculatorPane.tsx`
- `client/src/lib/formatting.ts`