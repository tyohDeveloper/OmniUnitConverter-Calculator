# Phase 6: Deduplication and Code Elimination

## What & Why
After the structural work of Phases 1-5, examine the codebase for reuse opportunities, dead code, and redundant logic. This phase also establishes lint/CI guardrails to enforce the file and function size rules going forward.

## Done looks like
- No function exceeds 20 lines; automated lint rule (or CI check) enforces this
- No file exports more than one function; automated check enforces this
- All dead code identified by the refactor is removed (unused imports, unreachable branches, superseded helpers)
- Any logic patterns that appear in 2+ places are consolidated into a shared pure function
- Test coverage is verified to be comprehensive; any gaps identified during the audit are filled
- The single-file HTML build is confirmed to produce a smaller or equal output compared to before the refactor (minimized, no comments, no extra whitespace)
- All tests pass

## Out of scope
- New features
- UI visual changes

## Tasks
1. **Audit for duplication** — Search for repeated logic patterns across the newly split files. Consolidate into shared pure functions where the same operation appears in more than one place.
2. **Remove dead code** — Delete unreachable branches, unused exports, and files that were made redundant by the refactor.
3. **Add lint rules** — Add eslint rules (or a custom script) that enforce: max file length, max function length, max exports per file. Integrate into CI.
4. **Final test audit** — Review test coverage across all new files. Add targeted unit tests for any pure function that lacks test coverage.
5. **Build verification** — Confirm the production single-file HTML output is valid, minimized, and comment-free.

## Relevant files
- `vite.config.ts`
- `package.json`
- `.eslintrc` (or equivalent config)
- `tests/`
