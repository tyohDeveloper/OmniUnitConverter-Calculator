# Replace lastCalcInputsRef Effect With a Reducer Action

> **Source.** Generated from the model-council architecture pass in `docs/perplexity/`. See [architecture-pass-council-synthesis.md](../perplexity/architecture-pass-council-synthesis.md) and [architecture-standards.md](../perplexity/architecture-standards.md).
> **Priority.** P1. Effect-driven derived state is invisible mutable memory.
> **Standards reference.** §2.2 (no useRef for a value that determines a later domain decision), §2.3 (setters dispatch action creators atomically).

## What & Why
`client/src/components/unit-converter/hooks/useCalculatorController.ts:674` holds a `lastCalcInputsRef` used as the memo key for an auto-compute `useEffect` at `:676-713`. The effect chains dispatches — e.g. `setCalcOp1('*'); return;` triggers a re-run that then computes the result — which is exactly the anti-pattern the reducer model exists to eliminate.

## Done looks like
- `lastCalcInputsRef` and the auto-compute effect are deleted.
- A pure `lib/calculator/computeCalcResult.ts` (single export, ≤20 lines) computes the result from `(field1, op1, field2, op2, field3)`.
- A new reducer action `RECOMPUTE_CALC_RESULT` (or an atomic `UPDATE_CALC_FIELD` that includes result recomputation in the reducer body) replaces the effect. Op-defaulting (the `setCalcOp1('*')` case) is done inside the reducer or its selector, atomically with the result update.
- No behavior change visible to E2E tests.

## Out of scope
- Any other refs in the controllers (covered by council-11).

## Tasks
1. **Extract `computeCalcResult`.** Pure function taking the five inputs and returning `{ result, op1, op2 }` with op-defaulting resolved.
2. **Design the reducer change.** Prefer folding recomputation into `UPDATE_CALC_FIELD` and the op setters so no separate `RECOMPUTE` action is needed. Update selectors to read the recomputed result.
3. **Delete the effect and the ref.** Update the controller to dispatch the atomic action.
4. **Run `tests/reducers.test.ts`** — the transition is now testable as a pure function.
5. **Run E2E** to confirm the behavior is unchanged.

## Relevant files
- `client/src/components/unit-converter/hooks/useCalculatorController.ts`
- `client/src/components/unit-converter/state/calculatorReducer.ts`
- `client/src/components/unit-converter/state/actions/calculatorActions.ts`
- `client/src/components/unit-converter/state/selectors/calculatorSelectors.ts`
- New: `client/src/lib/calculator/computeCalcResult.ts`
- `tests/reducers.test.ts`
- `tests/rpn-calculator.test.ts`
