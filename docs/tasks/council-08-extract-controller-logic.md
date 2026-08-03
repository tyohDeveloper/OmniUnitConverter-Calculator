# Extract Parsing / Formatting / Value-Construction From Controllers

> **Source.** Generated from the model-council architecture pass in `docs/perplexity/`. See [architecture-pass-council-synthesis.md](../perplexity/architecture-pass-council-synthesis.md) and [architecture-standards.md](../perplexity/architecture-standards.md).
> **Priority.** P1. Controllers must orchestrate, not implement.
> **Standards reference.** §1.2 (controllers may not implement arithmetic, dimensional policy, formatting algorithms, or unit-text parsing).

## What & Why
Even after council-02, -03, and -06 land, `useConverterController` still contains substantial pure logic that should live in `lib/`:

- `useConverterController.ts:398-423` — direct-unit construction.
- `useConverterController.ts:429-447` — DMS / feet-inch parsing.
- `useConverterController.ts:449-477` — conversion calculation.
- `useConverterController.ts:499-514` — input sanitization.
- `useConverterController.ts:539-609` — a 70-line copy-and-push transformation.

## Done looks like
- Each of the five blocks above is extracted to a single-export file under `client/src/lib/` with sub-20-line functions and dedicated tests.
- The controller becomes a thin sequence of `const x = pureFn(input); dispatch(action(x))` calls.
- Total line count of `useConverterController.ts` drops below ~200 (from 809 today) or the file is split by concern.
- All existing tests pass; new tests cover the extracted pure functions.

## Out of scope
- The formatting duplication (council-06).
- Reducer redesign (out of scope for this task).

## Tasks
1. **Extract direct-unit construction** to `lib/units/buildDirectUnit.ts` (single export).
2. **Extract DMS / feet-inch parsing** to `lib/formatting/parseCompoundNumber.ts` (or under `lib/formatting.ts` if the standards §3 file-length permits — otherwise its own file).
3. **Extract conversion calculation** to `lib/calculator/computeConversion.ts`.
4. **Extract input sanitization** to `lib/formatting/sanitizeInput.ts`.
5. **Extract copy-and-push transformation** to `lib/calculator/buildPushFromConverter.ts` — split into ≤20-line composed functions.
6. **Rewrite the controller** to call each extraction and dispatch its result.
7. **Add tests** for every new file. Update characterization tests if needed.

## Relevant files
- `client/src/components/unit-converter/hooks/useConverterController.ts`
- New: `client/src/lib/units/buildDirectUnit.ts`, `client/src/lib/calculator/{computeConversion,buildPushFromConverter}.ts`, sanitization/parsing files under `lib/formatting/`
- `tests/` — new test files per extraction
