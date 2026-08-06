# Sync main with GitHub remote

## What & Why
Local `main` is ahead of `origin/main` by one commit — `0cbb899 fix(date): substitute CLDR ERA1/ERA0 placeholders with authored Coptic/Ethiopic era labels`. Claude's remote work does not contain this fix (verified: no ERA1/ERA0 handling on origin/main). Publish it so the next pull on the Claude side includes it.

## Done looks like
- `origin/main` contains the ERA1/ERA0 era-label fallback fix
- Local `main` and `origin/main` are at the same commit (no ahead/behind)
- Working tree stays clean; no history rewriting of already-published commits

## Out of scope
- Any code changes beyond resolving merge conflicts, should new remote commits have landed
- Addressing the documented deferred items (numeral-system control, datetime input, etc.)

## Steps
1. **Fetch and reconcile** — Fetch the latest from origin; if new remote commits arrived since the last fetch, integrate them (rebase the single local commit on top, or merge), resolving any conflicts and verifying typecheck/tests still pass afterward.
2. **Push** — Push `main` to origin and confirm local and remote are in sync.

## Relevant files
- `client/src/lib/calculator/applyFallbackEraLabels.ts`
- `client/src/lib/calculator/computeDateConversion.ts`
