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

## Status (2026-08-05 review)

**Partially closed.** Tasks 1, 3, 4, 5 (the mechanical refactor) landed
in `9f80529` — controller's inline switches are gone and dispatch
routes through `applyRpnUnary` / `applyRpnBinary` in lib. Task 6 (full
test suite green) is confirmed at HEAD.

**Still open: task 2 — decide dimensional policy.** The two latent
defects GPT 5.6 Sol flagged during the council review were carried
over into the lib code as-is, without being decided or tested:

- **`sqrt` / `cbrt` silently round odd exponents up.** See
  `client/src/lib/calculator/rpnOps/powerOps.ts`:
  `Math.ceil(v / 2)` for `sqrt`, `Math.ceil(v / 3)` for `cbrt`. Effect:
  `sqrt(m³)` returns `m²` silently rather than either representing a
  fractional exponent (`m^1.5`), rejecting the input (`null`), or
  promoting to dimensionless. No test pins whichever behavior is
  correct, so a future refactor could quietly change it either way.

- **`exp`, `ln`, `log10`, `log2`, `pow10`, `pow2` preserve input
  dimensions.** See `client/src/lib/calculator/rpnOps/logOps.ts`:
  each case returns `dims: { ...d }`. Effect: `ln(m)` returns a value
  labelled with unit `m`, which is dimensionally nonsensical —
  transcendental functions require dimensionless input. Same lack of
  test coverage.

**What still needs to happen:**

1. Pick a behavior for each family (recommendations bracketed):
   - `sqrt` / `cbrt` on non-divisible exponents → [return `null`] or
     [silently continue with `Math.ceil` (status quo)] or
     [represent fractional exponents in the dims record]. The `null`
     choice matches how `ln(negative)` and `recip(0)` already reject.
   - `exp` / `ln` / `log10` / `log2` / `pow10` / `pow2` on dimensioned
     input → [return `null`] or [silently strip dimensions and return
     dimensionless]. The `null` choice is stricter and matches the
     rest of the RPN op family's failure mode.
2. Add explicit tests to `tests/rpn-calculator.test.ts` (or a new
   `tests/rpn-dimensional-policy.test.ts`) pinning each decision.
3. Update the relevant `rpnOps/*.ts` file to match. Small change if
   the recommendation above is chosen (return `null` in a few
   `case`s).
4. Record the decision as an appendix in
   `docs/perplexity/architecture-standards.md` — the earlier plan said
   §5 but that section is now "Data-external rule"; a fresh appendix
   is cleaner. One paragraph per family stating the policy and its
   rationale.

**Trigger to revive.** Opportunistic. The current behavior is a
correctness time-bomb, not a live user-facing bug — no one has
reported `sqrt(m³)` returning `m²` because the RPN calculator's
primary users work with common cases (`sqrt(m²) = m`, `ln(x)` on
dimensionless x). Revive if a user reports the surprise, or when the
next RPN-adjacent change lands and the reviewer wants the policy
pinned before adding more ops.
