# Split CalculatorPane Into Simple and RPN Sub-Panes

> **Source.** Generated from the model-council architecture pass in `docs/perplexity/`. See [architecture-pass-council-synthesis.md](../perplexity/architecture-pass-council-synthesis.md) and [architecture-standards.md](../perplexity/architecture-standards.md).
> **Priority.** P1. Must land *after* logic extraction (council-07), not before.
> **Standards reference.** §3.5 (React JSX exception cap: 250 lines/file).

## What & Why
`client/src/features/unit-converter/components/CalculatorPane.tsx` is 1,210 lines. It contains two distinct UIs (simple calculator and RPN) branching at `:196` and `:256`. It also owns five refs (`rpnXInputRef`, `suppressXBlurRef`, `committedXTextRef`, `enterCommitKeepFocusRef`, plus a display-value ref) devoted to the RPN X-register's focus/blur choreography and an iOS WebKit Done-key workaround documented at `:93-96`.

Splitting *before* extracting the logic (council-07) would just distribute the standards violations across more files. This task assumes council-07 has landed.

## Done looks like
- `CalculatorPane.tsx` is replaced by `SimpleCalculatorPane.tsx` and `RpnCalculatorPane.tsx`, each ≤250 lines, plus a small `CalculatorPane.tsx` that switches between them based on the current mode.
- The RPN X-register focus/blur choreography (including the iOS WebKit workaround, comments preserved verbatim) is extracted to a dedicated hook `useRpnXEditField.ts` (≤150 lines).
- No behavior change; all Playwright tests continue to pass unchanged.
- Testids are preserved (§4.6 additive-only rule).

## Out of scope
- Extracting logic that hasn't already been moved by council-07.
- Behavior changes.

## Tasks
1. **Verify council-07 has landed.** If not, block this task.
2. **Extract `useRpnXEditField`.** Move all X-register refs and the commit/blur/enter handlers into this hook. Keep the iOS WebKit comments at their new home.
3. **Create `SimpleCalculatorPane.tsx`.** Everything under the simple-mode branch, imports the controller hook.
4. **Create `RpnCalculatorPane.tsx`.** Everything under the RPN-mode branch, imports `useRpnXEditField` and the controller.
5. **Rewrite `CalculatorPane.tsx`.** Now ≤50 lines: read `calculatorMode`, render the matching sub-pane.
6. **Run E2E.** All `tests/e2e/rpn-focus.e2e.ts` scenarios must pass unchanged.

## Relevant files
- `client/src/features/unit-converter/components/CalculatorPane.tsx`
- New: `client/src/features/unit-converter/components/{SimpleCalculatorPane,RpnCalculatorPane}.tsx`
- New: `client/src/components/unit-converter/hooks/useRpnXEditField.ts`
- `tests/e2e/rpn-focus.e2e.ts`
