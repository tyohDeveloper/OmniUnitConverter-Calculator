# Remove Dead Conditional; Add Lint To Prevent Recurrence

> **Source.** Generated from the model-council architecture pass in `docs/perplexity/`. See [architecture-pass-council-synthesis.md](../perplexity/architecture-pass-council-synthesis.md) and [architecture-standards.md](../perplexity/architecture-standards.md).
> **Priority.** P2. Small in isolation; diagnostic of the enforcement blind spot council-12 closes.
> **Standards reference.** §10.2 (dead code removed on sight, CI dead-branch scan).

## What & Why
`client/src/features/unit-converter/components/CalculatorPane.tsx:534-539` contains an `if…else` where both branches call `setResultPrefix(val)` identically. Claude Fable 5 identified this as the smallest and most diagnostic finding in the council pass: this is exactly the class of defect that accumulates in a file no linter or test looks at. Delete the branch *and* add the lint rule so it can't come back.

## Done looks like
- The dead conditional at `CalculatorPane.tsx:534-539` is removed; the single remaining `setResultPrefix(val)` call replaces it.
- ESLint (added in council-12) has `no-dupe-else-if` enabled at `error` level, along with `no-unreachable` and `no-constant-condition`.
- A one-shot `ts-prune` scan is added to the build (or a separate `check:dead` script) to catch unused exports.
- Any additional dead branches surfaced by these two checks are removed in the same PR.

## Out of scope
- Adding ESLint itself (that's council-12; this task assumes ESLint is present).
- Refactoring the surrounding function (covered by council-07 or -09 depending on where the branch lives after those tasks land).

## Tasks
1. **Delete the dead branch** at `CalculatorPane.tsx:534-539`.
2. **Enable `no-dupe-else-if`, `no-unreachable`, `no-constant-condition`** in `eslint.config.js` at `error` level.
3. **Add `ts-prune` as a devDependency** and wire `npx ts-prune --error` into the build (or a `check:dead` script called from `build`).
4. **Sweep** — fix everything the two checks find in the same PR, or open follow-up tasks for anything larger than a single-file fix.
5. **Update `docs/perplexity/architecture-standards.md` §10.2** if the tool set for the dead-branch scan changes.

## Relevant files
- `client/src/features/unit-converter/components/CalculatorPane.tsx`
- `eslint.config.js`
- `package.json`
- `scripts/verify-build.mjs` (may reference the new checks)
