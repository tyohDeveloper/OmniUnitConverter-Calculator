# Phase 5: UI Monolith Decomposition

## What & Why
`unit-converter.tsx` at 3,900 lines is the single biggest source of merge conflicts and the hardest file to understand. After Phases 2-4 have extracted logic and state, this file should be mostly JSX wiring. Phase 5 splits it into a small set of pane-level components and a thin app controller, following the principle that UI elements used in exactly one place don't need to be split further.

The clearly separable areas are: the converter pane (input fields, unit selectors, result display), the calculator pane (expression input, RPN stack display, operator buttons), the direct/manual entry pane, and the top-level app controller that coordinates between them.

## Done looks like
- `unit-converter.tsx` is replaced by `features/unit-converter/app/UnitConverterApp.tsx` — a thin controller that renders the panes and wires context
- `features/unit-converter/components/ConverterPane.tsx` — the unit conversion input/output area
- `features/unit-converter/components/CalculatorPane.tsx` — the calculator and RPN display area
- `features/unit-converter/components/DirectPane.tsx` — the direct/manual entry area (if applicable)
- Each pane file is ≤ the minimum needed; sub-elements that appear only once within a pane may remain inline in that pane file
- `pages/home.tsx` and `App.tsx` are updated to import from the new location
- The original `unit-converter.tsx` file is deleted
- All E2E tests pass; visual behavior is unchanged

## Out of scope
- Changing any visual appearance or behavior
- New features
- Logic changes (those are done in Phase 2)

## Tasks
1. **Create `UnitConverterApp.tsx` controller** — A thin orchestration component that renders the panes and connects context. No business logic.
2. **Extract `ConverterPane.tsx`** — The unit conversion input/output area, reading state from context and dispatching actions.
3. **Extract `CalculatorPane.tsx`** — The calculator/RPN interface, reading state from context and dispatching actions.
4. **Extract any remaining distinct panes** — Identify and extract any other clearly separable UI areas.
5. **Update imports and delete the monolith** — Update `home.tsx` and any other references, then delete `unit-converter.tsx`.
6. **Run E2E tests to confirm identical behavior** — All user flows must work as before.

## Relevant files
- `client/src/components/unit-converter.tsx`
- `client/src/components/unit-converter/components/CalculatorFieldDisplay.tsx`
- `client/src/components/unit-converter/context/ConverterContext.tsx`
- `client/src/components/unit-converter/constants.ts`
- `client/src/pages/home.tsx`
- `client/src/App.tsx`
- `tests/e2e/converter.e2e.ts`
