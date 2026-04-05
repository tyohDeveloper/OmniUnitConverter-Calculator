# Phase 4: State Abstraction with Reducers

## What & Why
Currently, state is scattered across `unit-converter.tsx` and the existing hooks. This makes it impossible to unit-test state transitions without rendering a component. Moving to `useReducer`-based state modules with pure reducers and exported selectors means every state transition can be tested as a plain function call, with no browser or DOM required.

The architect recommends four state domains: converter (field values, selected units, category), calculator (expression, result, mode), RPN stack, and UI preferences (locale, number format, theme).

## Done looks like
- Four reducer modules exist: `state/converterReducer.ts`, `state/calculatorReducer.ts`, `state/rpnReducer.ts`, `state/uiPrefsReducer.ts` — each in its own file, exporting one reducer function
- Each reducer file has a corresponding actions file (one action creator per file) and a selectors file (one selector per file), all ≤20 lines
- `ConverterContext.tsx` is updated to compose the four reducers via `useReducer` and expose only `state + dispatch`
- Existing hooks (`useConverterState`, `useCalculatorState`, `useRpnStack`) are refactored to dispatch actions rather than hold internal state
- All reducer logic is covered by pure unit tests (no `renderHook`, no DOM)
- Hook-level tests are updated to test the wiring rather than the logic
- All existing E2E tests pass

## Out of scope
- UI component decomposition (Phase 5)
- Any changes to domain/conversion/calculator pure functions (Phase 2)

## Tasks
1. **Define action types and reducer for converter state** — Create `state/converterReducer.ts` with a pure reducer handling field input, unit selection, category change, and swap actions. One action creator per file.
2. **Define action types and reducer for calculator and RPN state** — `state/calculatorReducer.ts` and `state/rpnReducer.ts`, each pure and independently testable.
3. **Define UI preferences reducer** — `state/uiPrefsReducer.ts` for locale, number format, and any display preferences.
4. **Compose reducers in context** — Update `ConverterContext.tsx` to use `useReducer` with the composed state domains and expose `state + dispatch`.
5. **Migrate hooks to dispatch model** — Update existing hooks to dispatch actions instead of managing their own state.
6. **Write unit tests for all reducers and selectors** — Each state transition is a pure test: `expect(reducer(state, action)).toEqual(expectedState)`.

## Relevant files
- `client/src/components/unit-converter/context/ConverterContext.tsx`
- `client/src/components/unit-converter/hooks/useConverterState.ts`
- `client/src/components/unit-converter/hooks/useCalculatorState.ts`
- `client/src/components/unit-converter/hooks/useRpnStack.ts`
- `client/src/components/unit-converter/hooks/useFlashFlag.ts`
- `client/src/components/unit-converter.tsx`
- `tests/hooks.test.ts`
- `tests/rpn-calculator.test.ts`
