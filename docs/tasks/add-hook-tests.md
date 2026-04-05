# Add Missing Hook Tests

## What & Why
Two state-management hooks — `useConverterState` and `useCalculatorState` — have no unit tests. These are the bridge between the UI and the core business logic. Adding tests for them now establishes a behavioral baseline that will make the upcoming refactor safe to execute.

## Done looks like
- `tests/hooks.test.ts` is extended (or a new test file added) covering `useConverterState` and `useCalculatorState`
- Tests verify initial state, state transitions, and key interactions for both hooks
- All 1,097 existing tests still pass alongside the new ones

## Out of scope
- End-to-end or browser-level tests
- Refactoring any existing code
- Testing UI components (only the hooks)

## Tasks
1. **Add `useConverterState` tests** — Cover initial state shape, value changes, category/unit selection, and any derived state (e.g., result calculation).
2. **Add `useCalculatorState` tests** — Cover initial state, mode switching (simple vs RPN), and state resets.

## Relevant files
- `client/src/components/unit-converter/hooks/useConverterState.ts`
- `client/src/components/unit-converter/hooks/useCalculatorState.ts`
- `client/src/components/unit-converter/hooks/index.ts`
- `tests/hooks.test.ts`
