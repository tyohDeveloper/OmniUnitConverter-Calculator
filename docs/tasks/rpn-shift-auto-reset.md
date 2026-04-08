# RPN Shift Auto-Reset After Key Press

## What & Why
The SHIFT button in the RPN calculator currently stays active (sticky) until the user presses SHIFT again. It should behave like a standard calculator modifier: activate on press, then automatically deactivate after the next calculator key is pressed.

## Done looks like
- Pressing SHIFT highlights the button as active
- Pressing any calculator key while SHIFT is active applies the shifted operation, then immediately resets SHIFT to inactive
- Pressing SHIFT again before any key cancels it (toggle off)
- Pressing SHIFT itself does not count as "a calculator key" for the purpose of resetting

## Out of scope
- Changes to which operations are available under SHIFT
- Any other calculator button behavior

## Tasks
1. **Reset shift after operation** — After any calculator button action is executed (unary ops, binary ops, stack ops, digit entry, etc.), call `setShiftActive(false)` to deactivate SHIFT. The SHIFT button's own toggle handler should remain unchanged.

## Relevant files
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
- `client/src/features/unit-converter/components/CalculatorPane.tsx`
