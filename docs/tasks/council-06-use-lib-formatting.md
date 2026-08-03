# Delete Duplicated Number-Formatting Code From useConverterController

> **Source.** Generated from the model-council architecture pass in `docs/perplexity/`. See [architecture-pass-council-synthesis.md](../perplexity/architecture-pass-council-synthesis.md) and [architecture-standards.md](../perplexity/architecture-standards.md).
> **Priority.** P1. Third of the three "same code, two implementations" defects the council identified.
> **Standards reference.** §1.2 (controllers must not implement formatting algorithms), §10.1 (deduplication).

## What & Why
`client/src/components/unit-converter/hooks/useConverterController.ts:253-374` re-implements `cleanNumber` and `formatNumberWithSeparators`, including branches for CJK-myriad grouping, Arabic-Indic numerals, and South Asian grouping conventions. The same functions already exist as compliant, tested pure functions in `client/src/lib/formatting.ts:154` (`cleanNumber`) and `:195` (`formatNumberWithSeparators`).

## Done looks like
- The controller-local `cleanNumber` and `formatNumberWithSeparators` are deleted.
- The controller imports both from `@/lib/formatting`.
- Any behavioral drift between the two implementations is resolved in favor of the lib version, with tests added for edge cases if drift is found.
- `tests/formatting.test.ts` retains full coverage; `tests/hooks.test.ts` continues to pass.

## Out of scope
- Extracting other logic from `useConverterController` (covered by council-08).

## Tasks
1. **Diff the two implementations line by line.** Note any differences in edge cases (empty string, NaN, Infinity, negative zero, locale-specific separators).
2. **Resolve differences in favor of the lib.** If a difference is a bug in the controller, deleting the controller version fixes it; add a test covering the case.
3. **Delete the controller-local functions.** Update all call sites within the controller to use the imported versions.
4. **Run tests.** Update fixtures only where they were locking in the (now removed) controller behavior.

## Relevant files
- `client/src/components/unit-converter/hooks/useConverterController.ts`
- `client/src/lib/formatting.ts`
- `tests/formatting.test.ts`
- `tests/hooks.test.ts`
