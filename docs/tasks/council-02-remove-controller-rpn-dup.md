# Delete the Controller's Inline RPN Op Dispatch

> **Source.** Generated from the model-council architecture pass in `docs/perplexity/`. See [architecture-pass-council-synthesis.md](../perplexity/architecture-pass-council-synthesis.md) and [architecture-standards.md](../perplexity/architecture-standards.md).
> **Priority.** P0. Single largest correctness risk identified by the council.
> **Standards reference.** §1.1–§1.2 (layer boundaries), §10.1 (deduplication).

## What & Why
`client/src/components/unit-converter/hooks/useCalculatorController.ts:454-559` contains a 28-case `switch` for RPN unary operations (`square`, `sqrt`, trig, hyperbolic, rounding, sign, abs) and a 9-case `switch` for binary operations, each with dimensional-exponent arithmetic inline. The same operations already exist as compliant pure functions at `client/src/lib/calculator/applyRpnUnary.ts` and `client/src/lib/calculator/applyRpnBinary.ts`, decomposed into `rpnOps/{powerOps,logOps,roundingOps,trigOps,hyperbolicOps,scalarOps,unitOps}.ts`. The lib versions are not imported by the controller.

The two implementations have already drifted: the lib returns entries without a `prefix` field while the controller writes `prefix: 'none'`; precision defaults differ. GPT 5.6 Sol's read of `:462-466` and `:467-472` also identifies potential dimensional-policy bugs (`sqrt`/`cbrt` silently round odd exponents up, `exp`/`ln` preserve input dimensions when they should require dimensionless input). Every bug fix currently has to land twice, and the version that runs is the one that violates the layer standards.

## Done looks like
- The inline unary and binary switches in `useCalculatorController.ts` (`:454-559`) are deleted.
- The controller imports `applyRpnUnary` and `applyRpnBinary` from `@/lib/calculator/` and dispatches to them.
- The result-entry shape returned to the reducer matches the lib's shape (no extraneous `prefix: 'none'` unless the reducer genuinely needs it — decide and document).
- The dimensional-policy questions raised in council review are decided by explicit tests: (a) `sqrt`/`cbrt` on odd exponents — round, reject, or represent fractional — with a test asserting the chosen behavior; (b) `exp`/`ln`/`log10`/`log2`/`pow10`/`pow2` on dimensioned input — reject with a typed error, or promote to dimensionless — with a test.
- All existing Vitest and Playwright tests pass.

## Out of scope
- Changing the UI presentation of RPN operations.
- Extracting the auto-compute effect at `:674-713` (council-10).
- Removing `dimMap` (council-03).

## Tasks
1. **Diff the two implementations.** Produce a short reference table: op → controller output → lib output for every case. Commit at `docs/tasks/council-02-rpn-diff.md` before making changes so the reviewer can see what shipped.
2. **Decide dimensional policy.** For each open question in the "Done" section, pick a behavior. Record the decision in `docs/perplexity/architecture-standards.md` §5 or a new appendix.
3. **Update the reducer contract if needed.** If the lib's shape differs from what `rpnReducer.ts` expects, add an adapter in `useCalculatorController.ts` (a pure mapper) or extend the reducer's action payload — whichever is smaller.
4. **Delete the inline switches and route to the lib.** `useCalculatorController.ts:454-559` becomes a call site: `applyRpnUnary(op, stack, options)` / `applyRpnBinary(op, stack, options)`.
5. **Extend unit tests.** `tests/rpn-calculator.test.ts` and `tests/calculator-functions.test.ts` gain cases for every decided-policy edge.
6. **Run the full suite** (`npm run build` once the build gate lands) and update characterization fixtures with the new-and-decided behavior where they were locking in the removed behavior.

## Relevant files
- `client/src/components/unit-converter/hooks/useCalculatorController.ts`
- `client/src/lib/calculator/applyRpnUnary.ts`
- `client/src/lib/calculator/applyRpnBinary.ts`
- `client/src/lib/calculator/rpnOps/*.ts`
- `client/src/components/unit-converter/state/rpnReducer.ts`
- `tests/rpn-calculator.test.ts`
- `tests/calculator-functions.test.ts`
- `tests/characterization.test.ts`
