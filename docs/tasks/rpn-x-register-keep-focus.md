# RPN X register keeps typing focus after Enter

## What & Why
In the dedicated RPN Calculator section only, pressing Enter/Return commits the X register value, but afterward the X register shows a focus box while real keyboard focus is lost — the user must click it before typing again. The X register should remain immediately typeable after Enter, but ONLY in the RPN Calculator section. On the Converter and Custom sections, entering unit quantities is the primary activity, so keyboard focus there must stay on the FROM field; any RPN calculator shown in those sections should require an explicit click on the X register before it accepts typing.

## Done looks like
- In the RPN Calculator section, typing a value and pressing Enter commits it (stack lifts as today), and the user can immediately type the next value without clicking.
- Visual focus indication matches actual keyboard focus (no "fake" focus ring on an unfocused element).
- In the Converter and Custom sections, focus remains on the FROM (input quantity) field; the RPN X register in those sections does not grab or retain focus and requires a click to type into.
- Standard calculator mode behavior is unchanged.
- Existing behaviors preserved: blur-commit when clicking elsewhere, focus restoration after Prefix/Unit dropdown interactions, undo, and the on-screen ENTER button.

## Out of scope
- Any changes to standard (non-RPN) calculator focus behavior.
- Changes to RPN stack semantics or Enter's commit/lift behavior.

## Steps
1. **Rework the Enter commit flow in the RPN X register** — instead of blurring and dropping back to display mode, commit the value and keep (or immediately restore) the input in edit mode with keyboard focus, so subsequent keystrokes go straight into the X register. Guard against the stale-closure metadata issue noted in project memory (compute X-origin metadata inside the functional stack updater).
2. **Ensure edit-mode re-entry is consistent** — verify the display/edit mode toggle and the auto-edit-on-tab-switch effect don't fight the new behavior (e.g., no double-commit from the blur handler when Enter already committed).
3. **Scope focus behavior to the RPN Calculator section only** — in the Converter and Custom sections, keep keyboard focus on the FROM quantity field; the X register there must not auto-focus or retain focus after Enter and should require an explicit click to edit.
4. **Test** — add/adjust unit or e2e coverage for "type value → Enter → type next value without clicking" in the RPN section, plus coverage that FROM-field focus is preserved in Converter and Custom; manually verify on iPad-like touch interaction that clicking away still commits.

## Relevant files
- `client/src/features/unit-converter/components/CalculatorPane.tsx:821-922`
- `client/src/features/unit-converter/components/CalculatorPane.tsx:750-760`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx:129-139`
- `client/src/components/unit-converter/hooks/useCalculatorController.ts:247-251`
