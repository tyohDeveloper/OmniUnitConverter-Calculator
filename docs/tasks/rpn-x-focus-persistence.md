# RPN X register keeps focus

## What & Why
On the RPN Calculator page the X register is the only text-entry field, but it loses focus whenever any operation button (stack ops, unary ops, Clear x, Clear unit, etc.) is clicked, forcing the user to click back into the field before typing again. Make the X register behave like the single entry field of a form: it should always hold focus so typing always goes into it.

## Done looks like
- When the RPN Calculator page is opened, the X register field is focused and ready for typing.
- After clicking any RPN button or UI control (stack operations, unary/binary ops, shift, Clear x, Clear unit, prefix/SI selectors, etc.), focus returns to the X register field automatically.
- After a button press (or on page load), the field is prepared for a fresh entry: the next typed character starts a new entry (via cleared or fully-selected text), and continued typing inserts at the cursor with normal editing (arrow keys, Home/End, backspace) working as in any text input.
- Existing behaviors keep working: Enter commit with focus retention, Escape cancel, iOS WebKit blur handling, and prefix/SI selector focus restoration.

## Out of scope
- Converter and Custom pages' focus behavior (Enter there still hands focus to their own primary inputs).
- Any change to RPN math/stack semantics or layout.
- Mobile virtual-keyboard UX beyond the existing WebKit workarounds.

## Steps
1. **Generalized focus restoration** — Introduce a shared mechanism (in the RPN X edit-field hook) that operation buttons use so clicking them does not permanently steal focus from the X input; after the button's action runs, focus (with text selected/cleared for fresh entry) returns to the X field. Follow the pattern already used by the prefix/SI selectors (mousedown preventDefault + suppress-blur + scheduled refocus).
2. **Wire all RPN controls** — Apply the mechanism to every button on the calculator pane: stack row operations, unary/shift rows, and bottom-row controls (Clear x, Clear unit, and others), ensuring each commits any pending typed X text before performing its operation.
3. **Page-load focus** — Ensure the X register enters edit mode and is focused when the RPN Calculator page mounts or is switched to, not only when the display is clicked.
4. **Tests** — Extend the existing RPN focus e2e spec to cover: focus after clicking operation buttons, fresh-entry behavior after a button press, and focus on page load; run e2e with the NixOS chromium path (PW_CHROMIUM_PATH=$(which chromium)).

## Relevant files
- `client/src/features/unit-converter/components/rpn/RpnXRegisterRow.tsx`
- `client/src/components/unit-converter/hooks/useRpnXEditField.ts`
- `client/src/features/unit-converter/components/rpn/RpnXRegisterSelectors.tsx`
- `client/src/features/unit-converter/components/rpn/RpnBottomRow.tsx`
- `client/src/features/unit-converter/components/rpn/RpnStackRowY.tsx`
- `client/src/features/unit-converter/components/rpn/RpnStackRowS3.tsx`
- `client/src/features/unit-converter/components/RpnCalculatorPane.tsx`
- `tests/e2e/rpn-focus.e2e.ts`
