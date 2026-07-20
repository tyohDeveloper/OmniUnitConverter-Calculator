# X register Enter focus behavior

## What & Why
Two related focus fixes for the X register input in the calculator:
1. On the dedicated RPN Calculator page, pressing Enter in the X register input commits the value but the input loses focus. The intended behavior (implemented but not working, especially on iPad/iOS WebKit) is that the X input stays focused and editable with its text selected, ready for the next entry.
2. On the Converter and Custom tabs, pressing Enter in the X register (sub-calculator) currently just blurs the input, leaving focus nowhere. Since converting entries is the primary activity on those tabs and the sub-calculator is used only occasionally, Enter should commit and then return focus to the primary entry field: the FROM value input on the Converter tab, or the VALUE input on the Custom tab.

## Root cause (verified in code)
The Enter handler in the X input's `onKeyDown` (lockRpnMode branch) commits the value and schedules `requestAnimationFrame(() => rpnXInputRef.current?.select())`. Two gaps:
1. On iOS WebKit, the Enter/Done key natively dismisses the keyboard, blurring the input *before* the rAF runs. The input's `onBlur` handler then sets `rpnXEditing` to false, which unmounts the input entirely (it's conditionally rendered on `rpnXEditing`), so there is nothing left to refocus.
2. The recovery only calls `.select()`, not `.focus()` first — `.select()` alone does not reliably restore focus on iOS WebKit.

## Done looks like
- On the RPN page, pressing Enter commits the X value and the X input remains focused and in edit mode, with its text selected so the next keystrokes replace it.
- On the Converter tab, pressing Enter in the X register commits the value and moves focus to the FROM value input.
- On the Custom tab, pressing Enter in the X register commits the value and moves focus to the VALUE input.
- Works on desktop browsers AND iPad Safari/Replit iOS app (the user's platform — WebKit quirks matter here).
- Escape, clicking away, and the prefix/alternative selector interactions still behave as before (no regressions to the existing blur-suppression logic).

## Out of scope
- Any change to RPN stack semantics (Enter is commit-only here; the on-screen ENTER button handles stack lift).
- Focus behavior of other inputs/tabs.

## Steps
1. In the X input's Enter handling for the locked RPN mode, prevent the default action and mark (via a ref) that an Enter-commit just happened, so the subsequent blur — if the browser fires one — does not exit edit mode (`setRpnXEditing(false)`) or clear the edit value.
2. In the recovery step after commit, call `.focus()` followed by `.select()` on the input ref (rAF or microtask), so focus is actively restored even if WebKit blurred the input; clear the Enter-commit flag afterward so normal blurs (tap elsewhere, Escape) still exit edit mode.
3. In the non-locked (Converter/Custom tabs) Enter branch, after the commit-and-blur, move focus to the primary entry field based on the active tab: the Converter FROM value input (a ref already exists in the converter context) or the Custom VALUE input (needs a ref added and forwarded to DirectPane). CalculatorPane will need the active tab and target refs passed down or accessed via context.
4. Verify no double-commit occurs (the existing `committedXTextRef` guard must still work) and that the blur-suppression ref for the adjacent prefix/alt selectors is unaffected.
5. Test: desktop Enter-repeat entry flow on RPN page; Enter in X register on Converter and Custom tabs lands focus on FROM/VALUE; Escape, click-away blur, selector interaction while editing; add/adjust a unit or e2e test if the existing test setup supports it.

## Relevant files
- `client/src/features/unit-converter/components/CalculatorPane.tsx:83-125,860-931`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx:129-139,484-498`
- `client/src/features/unit-converter/components/ConverterPane.tsx:94-104`
- `client/src/features/unit-converter/components/DirectPane.tsx:100-118`
- `client/src/components/unit-converter/state/rpnReducer.ts`
