# Ship Testids in Production; Fix Duplicates; Codify Grammar

> **Source.** Generated from the model-council architecture pass in `docs/perplexity/`. See [architecture-pass-council-synthesis.md](../perplexity/architecture-pass-council-synthesis.md) and [architecture-standards.md](../perplexity/architecture-standards.md).
> **Priority.** P0. The stated standard ("every UI object should have a unique identifier for UI testing") is currently unmet in the shipped artifact.
> **Standards reference.** §4 (UI-object identifiers).

## What & Why
Three problems with the current testid layer:

1. **Production stripping.** `client/src/lib/test-utils.ts:3-8` returns `{}` when `import.meta.env.DEV` is false. The ~11 IDs emitted through the helper — including `input-value`, which a Playwright test at `tests/e2e/rpn-focus.e2e.ts:97` queries by name — do not exist in the shipped single-file artifact.
2. **Duplicates.** `client/src/features/unit-converter/app/UnitConverterApp.tsx:252` renders `data-testid="display-category"` inside a `.map()` over every category, so the value appears many times in the DOM. The domain key `{cat.id}` is present as `data-category-id` right next to it. `DirectPane.tsx` has similar fanout on mapped physical-quantity buttons.
3. **Grammar not codified.** The codebase already uses `{role}-{area}-{name}[-{key}]` (button-, select-, display-, text-, panel-, backdrop-, calc-, rpn-, custom-) but this is not documented and not enforced.

## Done looks like
- `test-utils.ts` returns `{ 'data-testid': id }` in every environment. Bundle-size delta measured and recorded in the PR body (~500 B post-gzip).
- `display-category` at `UnitConverterApp.tsx:252` becomes `display-category-${cat.id}`.
- Every remaining `.map()` that renders an interactive primitive includes the domain key in its testid (DirectPane mapped buttons; any others surfaced by a repo-wide scan).
- `scripts/testid-manifest.json` is committed with the full list of testids the shipped artifact must contain. `verify-build.mjs` fails on any drop below manifest count (§4.7).
- A new `tests/testids-unique.test.tsx` renders each major pane and app-wide, and asserts no duplicate `data-testid` values.
- `docs/tasks/add-meaningful-testids.md` is updated to reflect the grammar defined in standards §4.2 and to unblock corrective renames per §4.6.

## Out of scope
- Adding testids to every widget listed in `add-meaningful-testids.md` (a follow-up task; this one only fixes production stripping, uniqueness, and codifies the grammar).

## Tasks
1. **Drop the DEV-only branch in `test-utils.ts`.** Keep the function signature so callers don't change.
2. **Repo-wide grep for `.map(` + `data-testid`.** Add `${domain-key}` to every fanout. Record the mapping (old → new-shape) in the PR body.
3. **Add rendered-DOM Vitest.** `tests/testids-unique.test.tsx`: import each pane, render, collect all `[data-testid]` values, assert `new Set(values).size === values.length`.
4. **Commit `scripts/testid-manifest.json`.** A script builds this from the source tree once and freezes the baseline; `verify-build.mjs` compares against it (see council-04, step 4).
5. **Update `add-meaningful-testids.md`.** Reword the "additive-only" clause to permit corrective renames via the §4.6 rename-manifest PR process.
6. **Update existing E2E tests** that referenced any renamed IDs.

## Relevant files
- `client/src/lib/test-utils.ts`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
- `client/src/features/unit-converter/components/DirectPane.tsx`
- `scripts/verify-build.mjs`
- `scripts/testid-manifest.json` (new)
- `tests/testids-unique.test.tsx` (new)
- `docs/tasks/add-meaningful-testids.md`
- `tests/e2e/*.e2e.ts`
