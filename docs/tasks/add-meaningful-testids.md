# Add Meaningful data-testid Attributes to UI Widgets

## What & Why
The testing tool struggles to locate the correct UI elements because many interactive widgets — unit dropdowns, calculator field displays, operator buttons, RPN stack controls, and the mode switch — lack `data-testid` attributes entirely. Adding descriptive, stable IDs to every interactive and data-displaying element will make automated tests reliable and unambiguous.

## Done looks like
- Every interactable widget in ConverterPane (both "from" and "to" rows), CalculatorPane (both simple and RPN modes), and DirectPane has a unique, descriptive `data-testid`.
- The testing tool can uniquely identify any widget by name without needing to match by text content, position, or CSS class.
- No existing `data-testid` values are changed or removed (additive only).

## Out of scope
- Changes to behavior, layout, or styling.
- Adding testIds to static, non-interactive display text (labels, headings).

## Tasks

1. **ConverterPane widget testIds** — Add testIds to: "from" prefix select trigger (`select-from-prefix`), "from" unit select trigger (`select-from-unit`), the clickable "from" unit name display (`display-from-unit-name`), the clickable category display (`display-category`), swap button (`button-swap`), precision select trigger (`select-precision`), result display area (`display-result`), "to" prefix select trigger (`select-to-prefix`), "to" unit select trigger (`select-to-unit`), the clickable "to" unit name display (`display-to-unit-name`), and the conversion factor display (`display-factor`).

2. **Simple Calculator widget testIds** — Add a `testId` prop to each `CalculatorFieldDisplay` call: `calc-field-1`, `calc-field-2`, `calc-field-3`. Add testIds to the result display motion.div (`calc-result`), result prefix select (`select-calc-result-prefix`), result unit alternative select (`select-calc-result-unit`), mode-switch label in simple mode (`button-switch-to-rpn`), precision select in simple mode (`select-calc-precision`), clear-calculator button in simple mode (`button-clear-calculator`), per-field clear buttons (`button-clear-field-1`, `button-clear-field-2`, `button-clear-field-3`), and each operator button pair: field-2 operators (`button-op1-multiply`, `button-op1-divide`, `button-op1-add`, `button-op1-subtract`) and field-3 operators (`button-op2-multiply`, `button-op2-divide`, `button-op2-add`, `button-op2-subtract`).

3. **RPN Calculator widget testIds** — Add a `testId` prop to each RPN `CalculatorFieldDisplay`: `rpn-field-s3`, `rpn-field-s2`, `rpn-field-y`. (The X field already has `rpn-x-field`.) Add testIds to: mode-switch label in RPN mode (`button-switch-to-simple`), precision select in RPN mode (`select-rpn-precision`), clear-stack button (`button-clear-rpn`), paste button (`button-rpn-paste`), RPN result prefix select (`select-rpn-result-prefix`), RPN result unit select (`select-rpn-result-unit`), and all stack control / function buttons using the pattern `button-rpn-{name}` (e.g., `button-rpn-enter`, `button-rpn-drop`, `button-rpn-undo`, `button-rpn-pull`, `button-rpn-swap`, `button-rpn-lastx`, `button-rpn-sin`, `button-rpn-cos`, `button-rpn-tan`, `button-rpn-asin`, `button-rpn-acos`, `button-rpn-atan`, `button-rpn-log`, `button-rpn-ln`, `button-rpn-exp`, `button-rpn-pow`, `button-rpn-sqrt`, `button-rpn-inv`, `button-rpn-pi`, `button-rpn-neg`, `button-rpn-abs`, etc. — cover all buttons in the function grid).

## Relevant files
- `client/src/features/unit-converter/components/ConverterPane.tsx`
- `client/src/features/unit-converter/components/CalculatorPane.tsx`
- `client/src/components/unit-converter/components/CalculatorFieldDisplay.tsx`
- `client/src/lib/test-utils.ts`
