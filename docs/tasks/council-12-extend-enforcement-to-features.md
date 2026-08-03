# Extend Size / Purity Enforcement To features/ and hooks/

> **Source.** Generated from the model-council architecture pass in `docs/perplexity/`. See [architecture-pass-council-synthesis.md](../perplexity/architecture-pass-council-synthesis.md) and [architecture-standards.md](../perplexity/architecture-standards.md).
> **Priority.** P1. Closes the enforcement blind spot that let the hot spots grow.
> **Standards reference.** §7 (enforcement mechanics), §3 (function and file granularity).

## What & Why
`scripts/lint-size.mjs` today only scans `client/src/lib/` (see `EXPORT_COUNT_RULE_DIRS` at `:27-31` and `FILE_LENGTH_APPLIES_DIRS` at `:122-125`). That's the layer that already complies. The uncovered layers — features, hooks, state — are exactly where the hot-spot files are.

Standards §7 names ESLint + typescript-eslint as the target enforcement toolchain (dev-only, zero shipped bytes). This task adopts ESLint and configures the size/export rules across `client/src/**`.

## Done looks like
- `eslint`, `typescript-eslint`, and `eslint-plugin-react` are in `devDependencies`.
- `eslint.config.js` (flat config) configures:
  - `@typescript-eslint/max-lines-per-function` = 20 (`skipBlankLines: true, skipComments: true`) across all `client/src/**/*.{ts,tsx}`.
  - `max-lines` = 100 for `client/src/lib/**`, 150 for `client/src/components/unit-converter/{hooks,state}/**`, 250 for `client/src/**/*.tsx`.
  - A custom rule (or `no-restricted-syntax`) that flags multiple exported functions per file in `client/src/lib/**`, matching the current `lint-size.mjs` behavior.
  - The React JSX carve-out from standards §3.5.
- Exceptions currently living in `lint-size.mjs:33-79` are migrated to ESLint `overrides` blocks with the same rationale comments.
- `npm run lint` runs ESLint over the whole tree. `build` calls `lint` in addition to `lint:size` (for the transition period per standards §7 table).
- Once ESLint owns all rules and every violation is either fixed or explicit-exception, `scripts/lint-size.mjs` is deleted (follow-up PR).

## Out of scope
- Fixing the violations ESLint will find (they're covered by council-07 through -10). This task adds the enforcement; earlier tasks bring the code into compliance.

## Tasks
1. **Add devDependencies.** `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin` (or the `typescript-eslint` meta-package), `eslint-plugin-react`. Note zero shipped-bundle impact in PR body per §13.7.
2. **Write `eslint.config.js`.** Flat config; per-directory `overrides` per §3.
3. **Add `"lint": "eslint client/src --ext .ts,.tsx"` to `package.json`.** Wire into `build` after `lint:size` for the transition.
4. **Migrate exceptions.** Copy the `lint-size.mjs` exclusion list into ESLint `overrides` with the same rationale comments.
5. **Baseline current violations.** Run ESLint and commit an `eslint-baseline.json` if too many violations exist to fix in one PR; drive it to zero over the follow-up tasks.
6. **Delete `scripts/lint-size.mjs`** in a follow-up PR once the ESLint set fully covers it.

## Relevant files
- `package.json`
- `eslint.config.js` (new)
- `scripts/lint-size.mjs` (deleted in follow-up)
- `docs/perplexity/architecture-standards.md` §7 (already references ESLint)
